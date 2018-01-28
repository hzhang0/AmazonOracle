from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import Http404, HttpResponse, JsonResponse
import json
from django.template import loader
import os
from django.conf import settings
import numpy as np
import pandas as pd
from keras.models import load_model
from keras.preprocessing.image import load_img, img_to_array
import keras.backend as K
import tensorflow as tf
import bcolz
from PIL import Image
from io import BytesIO
import base64
import logging
from amazon.api import AmazonAPI

keys = json.load(open(os.path.join(settings.STATIC_ROOT, 'endpoint/keys.json'),'r'))
pd.options.mode.chained_assignment = None
logger = logging.getLogger('django')
amazon = AmazonAPI(keys['access_key'], keys['secret_key'], keys['associate_id'], region = 'CA', MaxQPS = 0.9)

def load_array(fname):
    return bcolz.open(fname)[:]

df = pd.read_csv(os.path.join(settings.STATIC_ROOT, 'endpoint/itemSubset.csv')).set_index('asin')
bns = pd.read_csv(os.path.join(settings.STATIC_ROOT, 'endpoint/BrowseNodes.csv'))
mapping = {j:i for i,j in enumerate(np.sort(df.search_index.unique()))}
reverseMapping = {i:j for i,j in enumerate(np.sort(df.search_index.unique()))}
indexToDep = {i[1]['Search Index']: i[1]['Department'] for i in bns.iterrows()}
final_model = load_model(os.path.join(settings.STATIC_ROOT, 'endpoint/Weights/final_model'))
fingerprints = load_array(os.path.join(settings.STATIC_ROOT, 'endpoint/Weights/all_features_inception'))
similar_images_to_get = 10

def updateData(df): #requests updated item info from amazon
    ans = amazon.lookup(ItemId = ', '.join(df.index))
    dfNEW = pd.DataFrame({'price': [float(i.price_and_currency[0]) if i.price_and_currency[0] is not None and not (pd.isnull(i.price_and_currency[0])) else None for i in ans],
                         'image_url': [i.large_image_url for i in ans],
                         'title': [i.title for i in ans],
                         'asin': [i.asin for i in ans]}).set_index('asin')
    logger.debug(dfNEW.price)
    logger.debug(df.price)
    for i in df.index:
        if i not in dfNEW.index:
            df.loc[i, 'exists'] = False
        else:
            if dfNEW.loc[i, 'title'] is None or dfNEW.loc[i, 'price'] is None or pd.isnull(dfNEW.loc[i,'price']):
                df.loc[i, 'exists'] = False
            else:
                df.loc[i, 'exists'] = True
                for j in dfNEW.columns:
                    df.loc[i, j] = dfNEW.loc[i,j]
    return df

def predict(img):
    X = np.expand_dims((2 * (img_to_array(img) / 255.0 - 0.5)), axis = 0)    
    price, cat, fingerprint = final_model.predict(X)
    return (price, indexToDep[reverseMapping[np.argmax(cat[0])]], *findSimilar(fingerprint)) 

def findSimilar(fingerprint):
    mostSimilar = df.iloc[(np.sum(np.square(fingerprints - fingerprint), axis = 1)).argsort()[:similar_images_to_get]][['title','image_url','price']]
    mostSimilar = updateData(mostSimilar).reset_index()
    avg_price = float(mostSimilar.price.mean())
    mostSimilar.asin = mostSimilar.asin.apply(lambda x: 'https://www.amazon.ca/gp/product/' + x)
    return mostSimilar.to_dict(orient = 'records'), avg_price

@csrf_exempt
def index(request):
    if request.method == 'POST':
        #logger.error(request.body)
        #logger.error(request.POST)
        #logger.error(json.loads(request.body).keys())
        #return HttpResponse(json.dumps({'asdf':3}), content_type='application/json')
        #return JsonResponse([1,2,3], safe = False)
        a = json.loads(request.body)['img']  
        logger.error(type(a))
        logger.error(len(a))
        pil_img = Image.open(BytesIO(base64.b64decode(a)))
        img = pil_img.resize((299,299), Image.NEAREST)
        response_data ={}
        price, cat, similarItems, avg_price = predict(img)
        response_data['predicted_price'] = round(float(price[0][0]),2)
        response_data['predicted_cat'] = cat
        response_data['similar_items'] = similarItems
        response_data['predicted_price_avg'] = round(avg_price,2) 
        logger.error(response_data)
        for count, i in enumerate(response_data['similar_items']):
            i['key'] = count
        #return JsonResponse({'predicted_cat': response_data['predicted_cat']})
        #return JsonResponse([1,2,3])
        return JsonResponse(response_data, safe = False)
    else:
        raise Http404('Use a post request instead!')

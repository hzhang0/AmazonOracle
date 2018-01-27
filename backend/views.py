from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import Http404, HttpResponse
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

def load_array(fname):
    return bcolz.open(fname)[:]

df = pd.read_csv(os.path.join(settings.STATIC_ROOT, 'endpoint/itemSubset.csv')).set_index('asin')
mapping = {j:i for i,j in enumerate(np.sort(df.search_index.unique()))}
reverseMapping = {i:j for i,j in enumerate(np.sort(df.search_index.unique()))}
final_model = load_model(os.path.join(settings.STATIC_ROOT, 'endpoint/Weights/final_model'))
fingerprints = load_array(os.path.join(settings.STATIC_ROOT, 'endpoint/Weights/all_features_inception'))

def predict(img):
    X = np.expand_dims((2 * (img_to_array(img) / 255.0 - 0.5)), axis = 0)    
    price, cat, fingerprint = final_model.predict(X)
    return (price, reverseMapping[np.argmax(cat[0])], *findSimilar(fingerprint)) 

def findSimilar(fingerprint):
    mostSimilar = df.iloc[(np.sum(np.square(fingerprints - fingerprint), axis = 1)).argsort()[:10]]
    return list(mostSimilar.index), list(mostSimilar.title)

@csrf_exempt
def index(request):
    if request.method == 'POST':
        pil_img = Image.open(BytesIO(base64.b64decode(request.POST['img'])))
        img = pil_img.resize((299,299), Image.NEAREST)
        response_data ={}
        price, cat, similarASIN, similarTitle = predict(img)
        response_data['predicted_price'] = float(price[0][0])
        response_data['predicted_cat'] = cat
        response_data['similarASIN'] = similarASIN
        response_data['similarTitle'] = similarTitle
        return HttpResponse(json.dumps(response_data), content_type='application/json')
    else:
        raise Http404('Use a post request instead!')

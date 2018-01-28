from django.shortcuts import render
from django.http import Http404, HttpResponse
import json
from django.template import loader

def index(request):
    context = {}
    return render(request,'mainsite/index.html',context)

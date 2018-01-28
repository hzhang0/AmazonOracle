# AmazonOracle

## Introduction
Given an image of an item, Amazon Oracle returns the predicted category and price of that item, and visually similar items currently being sold on Amazon.

## Practical Uses
### Find Predicted Price & Category
This app is useful for merchants or consumers who want to check the price of a product. 

### Find Similar Items
If you are looking at an item, you can use this app to find similar items that leads you to the product page instantly.

## Implementation
### Data Collection
Data (such as image, price, title, ASIN) was collected from the Amazon.ca marketplace using the Amazon Product Advertising API. (Disclaimer: this was done several days prior to the start of the hackathon). Over 100,000 images were gathered.

### Model Building
Using Keras with Tensorflow, we fine-tuned Google's InceptionV3 convolutional neural network, to produce two outputs: a continuous price output, and a discrete category output. A fingerprint is also generated for each image.

### Back End
The back-end is built with Django on top of an AWS EC2 instance. This instance does the predictions given a new image.

### React-Native
The front-end of the app is built with React-Native. User will upload a photo to our server endpoint through the app with a POST request, then predicted information will be returned for display in the app.


## Examples
Home > Predicted Info > Similar Items
![](/react-native/AmazonOracle/img/Screenshots/example.png)

import json
import datetime
import string
import random

def lambda_handler(event,context):
    text = event['messages'][0]['unstructured']['text']
    reply = 'Sorry, say again?'
    
    if text == 'Hello':
        reply = "Hi there, how can I help? (Book flowers / Book food"
        
    if text == 'Book flowers':
        reply = "What flowers do you want? (Lily or Rose"
    if text == 'Book food':
        reply = "What foods do you want? (Pizza or Rice"
    
    if text in ['Lily', 'Rose', 'Pizza', 'Rice']:
        response = text
        reply = "OK you book "+response + '. Delivery Now? (Y/N'
    if text == 'Y':
        reply = 'Will be delivered soon! Thanks'
    if text == 'N':
        reply = 'OK No delivery. Thanks'
    
    now = datetime.datetime.now()
    time = str(now.hour - 4) + ':' + str(now.minute) + ':' + str(now.second)
    
    id = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    
    return_info = {"messages": [{"type": "string","unstructured": {"id": id,"text": reply,"timestamp": time}}]}
    json1 = json.dumps(return_info)
    
    return json1
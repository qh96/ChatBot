# Chatbot

Introduction:
In this assignment, we created a concierge chatbot which enables users to sign up, sign in and chat with a robot to get restaurant suggestions. In summary, we: 
1) implemented AWS Cognito (User Pool & Identity Pool) for user authorization, management and credentials assignment.
2) implemented Amazon Lex (console) to chat with users, also implemented Amazon Lex (Lambda LF1 code hook) for initialization and validation. 
3) implemented SQS with LF2 lambda function, utilized Google Place API to make suggestions on restaurants which were then stored it in DynamoDB, implemented functions to send text messages using SMS Message with SNS, set up CloudWatch event trigger to invoke functions to be automatically executed.
4) Integration of different components see:
<Front-end> --- <API Gateway> --- <Lambda> --- <Lex>




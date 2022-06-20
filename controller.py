import time
from credentials.config import *
import AWSIoTPythonSDK
import AWSIoTPythonSDK.MQTTLib as AWSIoTPyMQTT
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import pandas as pd
from matplotlib import pyplot as plt
#set device up a a conterxt manager
# class File(object):
    	
#     def __init__(self, filename, mode):
#         self.filename = filename 
#         self.mode = mode 
#     def __enter__(self):
#         self.file = open(self.filename, self.mode)
#         return self.file
#     def __exit__(self, exec_type, exec_val, traceback):
#         self.file.close()

# with File('code_snippets.txt', 'w') as f:
# 	f.write('this is the file we are using)

# print(f.close)

TOPIC = 'pump/pressure'

class Device(object):
    '''A class as an interface for any IoT thing which can be registered

    such as sensors actuators etc..   
    these are considered AWS IoT MQTT Clients using TLSv1.2 Mutual Authentication'''

    def __init__(self, client_ID: str):

        self.client: AWSIoTMQTTClient = AWSIoTPyMQTT.AWSIoTMQTTClient(
            client_ID)
        self.configure_client()

    def configure_client(self):
        self.client.configureEndpoint(END_POINT, 8883)
        self.client.configureCredentials(
            PATH_TO_ROOT_CA, PATH_TO_PRIVATE_KEY, PATH_TO_CERTIFICATE)
        self.client.connect(keepAliveIntervalSecond=1000)

    def publish_data(self, topic: str, payload):
        '''topic format -> thing/measurement/property

        i.e. topic : sensor/temperature/high'''
        self.client.publish(topic, payload, 1)

    def subscribe_to_topic(self, topic: str, custom_callback):
        '''Callback functions should be of the following form

        def callback(client,used_data,message):
            function(message)

        where message has properties message.payload and message.topic'''
        self.client.subscribe(topic, 1, custom_callback)

    def tear_down(self, topic):
        self.client.disconnect()
        self.client.unsubscribe(topic)

batch_size = 100
data = []

def call_back(client, user_data, message):
    global data_size
    print(str(message.payload)[str(message.payload).find('b')+1:].replace("'",''))
    data.append(int(str(message.payload)[str(message.payload).find('b')+1:].replace("'",'')))
    if len(data)%batch_size == 0:
        df = pd.DataFrame(data)
        df.plot()
        plt.show()

compressor = Device('compressorID')

for i in range(1000):
    try:
        compressor.subscribe_to_topic(TOPIC, call_back)
    except AWSIoTPythonSDK.exception.AWSIoTExceptions.subscribeTimeoutException:
        pass

compressor.tear_down(TOPIC)

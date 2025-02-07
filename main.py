from http.server import BaseHTTPRequestHandler, HTTPServer
import time
import json
import threading
import random
from websockets.sync.server import serve

sockets = {}

def messageHandler(socket):
    for message in socket:
        socket.send("hello!")
        print(message)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        id = random.randint(0, 1000)
        self.send_response(200)
        self.send_header('Content-type','text/html')
        self.end_headers()

        message = ''.join(open("index.html").readlines()).replace("$$$IDENTIFIER", str(id))
        self.wfile.write(bytes(message, "utf8"))
        with serve(messageHandler, "localhost", 8484) as server:
            s = threading.Thread(None, server.serve_forever)
            s.start()

'''
    def do_POST(self):
        global awaitingMessages
        print("POST")
        content_len = int(self.headers.get('Content-Length'))
        body = json.loads(self.rfile.read(content_len))

        if body['type'] == "poll":
            awaitingMessages[body['user']] = self
        else:
            if body['type'] == "send":
                print(body['target'], body["message"])
                target = awaitingMessages[int(body['target'])]
                target.send_response(200)
                target.send_header('Content-type','text/html')
                target.end_headers()

                message = body["message"]
                target.wfile.write(bytes(message, "utf8"))


            self.send_response(200)
            self.send_header('Content-type','text/html')
            self.end_headers()

            message = "Hello, World! Here is a POST response"
            self.wfile.write(bytes(message, "utf8"))
        print(awaitingMessages)
'''

with HTTPServer(('', 8000), handler) as server:
    server.serve_forever()

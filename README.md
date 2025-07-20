1) Setup Instructions

Prerequisites:
Node.js
npm
MongoDB(Atlas cluster)
Internet connection

backend setup:
cd server
npm install

configure environment(.env in server folder):
port: 500
MONGODB_URI: your cluster connection

run backend server:
npm start

Frontend setup:
cd client
npm install

run frontend:
npm start

2)API Documentation
REST Endpoints: 

POST---->  /api/rooms/join	
Join an existing or create a room	
req body: { roomId?: String }	
res: { success, roomId, drawingData }
GET	----> /api/rooms/:roomId	
Get info for a specific room	
req body: None	
res body: { success, room: { roomId, createdAt, drawingData } }

Socket.io Events:

join-room	--> Join or create a room
leave-room --> Leave the room
user-count  --> Number of active users in the room
cursor-move	--> Cursor position update/track others
draw-start	--> Start a drawing stroke
draw-move	--> Draw path increment
draw-end	--> Both	optional payload	Finish stroke
clear-canvas	--> Clear the current canvas
load-drawing	-->	Bulk load of all previous drawing data

3. Architecture Overview
   
Backend
Language/Framework: Node.js, Express.js, Socket.io, Mongoose

Database: MongoDB

Entry Point: server/server.js

Key Structure:

models/Room.js: Room schema/model, including drawingData

routes/rooms.js: REST endpoints for room creation/joining/info

socket/socketHandlers.js (optional modularization): Handles all Socket.io real-time events

Persistent Data:

Room: { roomId, createdAt, lastActivity, drawingData }

drawingData: Array of drawing command objects (strokes, clears)

Frontend
Language/Framework: React.js

Key Components:

RoomJoin.js: Room code entry and create logic

Whiteboard.js: Main session logic and sub-component coordination

DrawingCanvas.js: Drawing logic with HTML5 canvas

Toolbar.js: UI controls for color, stroke width, clear canvas

UserCursors.js: Shows real-time user cursors

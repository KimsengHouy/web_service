const http = require("http")
const socket = require("websocket").server
const server = http.createServer(() => {
})

server.listen(443, () => {

})

const users = []

const Types = {
    SignIn: "SignIn",
    StartStreaming: "StartStreaming",
    RequestStartStreaming: "RequestStartStreaming",
    NoSharingStreamPermission: "NoSharingStreamPermission",
    UserFoundSuccessfully: "UserFoundSuccessfully",
    Offer: "Offer",
    Answer: "Answer",
    IceCandidates: "IceCandidates",
    EndCall: "EndCall",
    SignedInUsers: "SignedInUsers",
    ScreenRotation: "ScreenRotation",	
}

const webSocket = new socket({httpServer: server})


webSocket.on('request', (req) => {
    const connection = req.accept();

    connection.on('message', (message) => {
        try {
            const data = JSON.parse(message.utf8Data);
            const currentUser = findUser(data.username)
            const userToReceive = findUser(data.target)
            console.log(data)

            switch (data.type) {
                case Types.SignIn:
                    if (currentUser) {
                        return
                    }

                    users.push({username: data.username, conn: connection, password: data.data})
                    break
                case Types.StartStreaming :
                    if (userToReceive) {
                            sendToConnection(userToReceive.conn, {
                                type: Types.StartStreaming,
                                username: currentUser.username,
                                target: userToReceive.username
                            })
                    }
                    break
		 case Types.RequestStartStreaming :
			 if (userToReceive) {
			    sendToConnection(userToReceive.conn, {
				    type: Types.RequestStartStreaming,
				    username: currentUser.username,
				    target: userToReceive.username
			    })
		   }
		    break  
		case Types.NoSharingStreamPermission :
			    if (userToReceive) {
			    sendToConnection(userToReceive.conn, {
				type: Types.NoSharingStreamPermission,
				username: currentUser.username,
				target: userToReceive.username,
				data: data.data    
			    })
			    }
		   break 
		case Types.ScreenRotation :
			    if (userToReceive) {
			    sendToConnection(userToReceive.conn, {
				type: Types.ScreenRotation,
				username: currentUser.username,
				target: userToReceive.target,
				data: data.data    
			    })
			    }
		   break 	    
                case Types.Offer :
                    if (userToReceive) {
                        sendToConnection(userToReceive.conn, {
                            type: Types.Offer, username: data.username, data: data.data
                        })
                    }
                    break
                case Types.Answer :
                    if (userToReceive) {
                        sendToConnection(userToReceive.conn, {
                            type: Types.Answer, username: data.username, data: data.data
                        })
                    }
                    break
                case Types.IceCandidates:
                    if (userToReceive) {
                        sendToConnection(userToReceive.conn, {
                            type: Types.IceCandidates, username: data.username, data: data.data
                        })
                    }
                    break
                case Types.EndCall:
                    if (userToReceive) {
                        sendToConnection(userToReceive.conn, {
                            type: Types.EndCall, username: data.username
                        })
                    }
                    break
		case Types.SignedInUsers:
			    console.log(data.type)
                    const signedInUsers = listOfSignedInUser(users)
			    console.log(signedInUsers)
			data.data = signedInUsers
                    sendToConnection(connection, {
                        type: Types.SignedInUsers,
                        users: data.username,
			    data:data.data
                    })
                    break
            }
        } catch (e) {
            console.log(e.message)
        }

    });
    connection.on('close', () => {
        users.forEach(user => {
            if (user.conn === connection) {
		console.log(user.username + ' close')
                users.splice(users.indexOf(user), 1)
            }
        })
    })
    connection.on('disconnect', (reason) => {
        users.forEach(user => {
            if (user.conn === connection) {
		console.log(user.username + ' disconnect with ' + reason)
            }
        })
    })
    connection.on('error', (err) => {
        users.forEach(user => {
            if (user.conn === connection) {
		console.log(user.username + ' error with ' + err)
            }
        })
    })
});


const sendToConnection = (connection, message) => {
    connection.send(JSON.stringify(message))
}

const findUser = username => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === username) return users[i]
    }
}

const listOfSignedInUser = users => {
	var usernames = []
	for (let i = 0; i < users.length; i++) {
        	usernames.push(users[i].username)
    	}
	return usernames
}

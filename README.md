# github-messaging

github-messaging was an attempt to play with Nodejs, couchdb,
socket.io, oauth authentication, etc during [nko3][1].

The idea is to be able to message any github user.  If the user
is online, an instant message will popup (socket.io).  Otherwise,
a mail will be sent with the details.  Of course, this is neither
unheard of nor new.  We could use IRC or plain email as well,
in place of github-messaging.  Github-messaging neither pretends
to be new or novel, in that regard.  Just an attempt at providing
a simpler solution to a problem I often face.

### Setup

        $ npm install
        $ node server.js

[1]: http://nodeknockout.com/

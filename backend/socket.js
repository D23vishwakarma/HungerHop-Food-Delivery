import { User } from "./models/user.model.js"

export const socketHandler = (io) => {
    io.on("connection", (socket) => {
        socket.on('identity', async ({ userId }) => {
            console.log('IDENTITY received for user:', userId, 'socket:', socket.id)
            try {
                const user = await User.findByIdAndUpdate(userId, {
                    socketId: socket.id, isOnline: true
                }, { new: true })
                console.log('Saved socketId on user doc:', user?.socketId)
            } catch (error) {
                console.log(error)
            }
        })
        socket.on('disconnect', async () => {
            try {
                const user = await User.findOneAndUpdate({ socketId: socket.id },
                    {
                        socketId: null,
                        isOnline: false
                    }
                )
            } catch (error) {
                console.log(error)
            }
        })
    })
}
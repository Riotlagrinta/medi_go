import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { type Express } from 'express';
import { supabase } from './db/index.js';

export const initSocket = (app: Express) => {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // En prod, restreindre à l'URL du frontend
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('Nouveau client connecté:', socket.id);

    // Rejoindre une "room" (ex: pharmacy_1 ou user_123)
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`User ${socket.id} a rejoint la room : ${room}`);
    });

    // Envoi de message
    socket.on('send_message', async (data: any) => {
      // 1. Sauvegarde en DB
      try {
        const { error } = await supabase.from('messages').insert([{
          pharmacy_id: data.pharmacy_id,
          sender_id: data.sender_id,
          content: data.content,
          is_from_pharmacy: data.is_from_pharmacy
        }]);
        
        if (!error) {
          // 2. Diffusion en temps réel à la room correspondante
          // Si c'est un patient qui écrit, on notifie la pharmacie
          // Si c'est la pharmacie, on notifie le patient (via son ID ou une room conversation)
          const targetRoom = data.is_from_pharmacy 
            ? `user_${data.sender_id}` // La pharmacie répond à un user
            : `pharmacy_${data.pharmacy_id}`; // Le user écrit à la pharmacie
          
          // On renvoie aussi à l'expéditeur pour confirmation immédiate
          io.to(targetRoom).emit('receive_message', data);
        }
      } catch (e) {
        console.error('Erreur socket save:', e);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client déconnecté:', socket.id);
    });
  });

  return httpServer;
};

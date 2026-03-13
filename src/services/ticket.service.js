import ticketModel from '../models/ticket.model.js';

class TicketService {
    // Generamos un código único para el ticket.
    generateCode() {
        return `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    }
    async create(purchaser, amount) {
        const ticket = {
            code: this.generateCode(),
            purchaser,
            amount
        };
        return await ticketModel.create(ticket);
    }
    async getById(id) {
        return await ticketModel.findById(id);
    }
}

export default new TicketService();
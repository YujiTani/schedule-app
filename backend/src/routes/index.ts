import { Hono } from 'hono';
import reservationsRoutes from './reservations.js';
import businessHoursRoutes from './businessHours.js';
import adminRoutes from './admin.js';

const app = new Hono();

// ルートをマウント
app.route('/reservations', reservationsRoutes);
app.route('/business-hours', businessHoursRoutes);
app.route('/admin', adminRoutes);

export default app;
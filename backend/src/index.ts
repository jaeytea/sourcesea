import cors from 'cors';
import express from 'express';
import { config } from './config';
import { resourcesRouter } from './routes/resources.routes';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/resources', resourcesRouter);

app.listen(config.port, () => {
  console.log(`SourceSea API listening on http://localhost:${config.port}`);
});

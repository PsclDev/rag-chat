import { Inject } from '@nestjs/common';

import { PG_PROVIDER } from 'app.definition';

export const InjectDrizzle = () => Inject(PG_PROVIDER);

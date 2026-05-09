import * as client from '@mysten/sui/client';
console.log(Object.keys(client).filter(k => k.includes('SuiObject')));

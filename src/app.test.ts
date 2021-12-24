import chai, { expect } from 'chai';
import { runApp } from './app';
import fs from 'fs';

describe('MyApp', () => {
    it('should return Hello World!', async () => {
        const res = await runApp();
        const a = 'foo';
        expect(res).to.equal('Hello World! xxx');
    });
});

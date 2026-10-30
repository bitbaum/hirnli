import { expect, test } from 'vitest';
import { sharedSignIn } from '../shared-signin';

const CONFIGURED = {
  SIGNIN_ISSUER: 'https://signin.example.test',
  SIGNIN_CLIENT_ID: 'hirnli',
  SIGNIN_CLIENT_SECRET: 'synthetic-secret',
};

test('no button without the shared sign-in configured', () => {
  expect(sharedSignIn({})).toBeNull();
});

test('no button with any one of the three values missing', () => {
  for (const name of Object.keys(CONFIGURED)) {
    expect(sharedSignIn({ ...CONFIGURED, [name]: '' })).toBeNull();
  }
});

test('no button for an issuer over plain http', () => {
  expect(sharedSignIn({ ...CONFIGURED, SIGNIN_ISSUER: 'http://signin.example.test' })).toBeNull();
});

test('the button names the providers, in German, and uses the provider AccountKit mounts', () => {
  expect(sharedSignIn(CONFIGURED)).toEqual({
    provider: 'bitbaum-signin',
    label: 'Weiter mit Google, Apple, GitHub, X oder Facebook',
  });
});

# Casio AS-A — virtual nixie-tube calculator

A React recreation of the 1960s Casio AS-A desktop calculator, extended to a fixed-width 21-digit nixie display.
All arithmetic uses [decimal.js](https://github.com/MikeMcl/decimal.js), so results are exact decimals (0.1 + 0.2 = 0.3).

## Keyboard

| Calculator key | Keyboard |
|---|---|
| 0–9 | 0–9 (main row or numpad) |
| `.` (decimal point) | `.` |
| × ÷ + − | `*` `/` `+` `-` |
| C (clear) | Space or Delete |
| = | Enter |
| erase last digit | Backspace |

The power switch on the left turns the calculator on and off. At power-on all 21 tubes light "0" for one second, then only the right-end "0" stays lit.

## Develop

```bash
npm install
npm run dev       # local dev server
npm test          # calculator engine tests
npm run build     # production build into dist/
```

## Deploy (Firebase Hosting)

```bash
firebase login
firebase use --add          # pick your Firebase project (creates .firebaserc)
npm run deploy              # builds and deploys dist/
```

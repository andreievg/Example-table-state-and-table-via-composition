```
yarn && yarn dev
```

All of the useShallow state comparison might be too much ? Wonder how it measures against running all of the component render code and doing virtual dom diff, need to bench with lots of rows.

I added console logs everywhere to show that render methods only run when particular state is updated. Technically button doesn't need to get reactive state and can get 'refs' so could have `useNonReactivePartialDataRow` in button

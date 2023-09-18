import { strict as assert } from 'node:assert';
import testUtils, { GLOBAL } from '../test-utils';
import { transformArguments } from './MREVRANGE';
import { TimeSeriesAggregationType, TimeSeriesReducers } from '.';

describe('TS.MREVRANGE', () => {
  it('transformArguments', () => {
    assert.deepEqual(
      transformArguments('-', '+', 'label=value', {
        FILTER_BY_TS: [0],
        FILTER_BY_VALUE: {
          min: 0,
          max: 1
        },
        COUNT: 1,
        ALIGN: '-',
        AGGREGATION: {
          type: TimeSeriesAggregationType.AVERAGE,
          timeBucket: 1
        },
        GROUPBY: {
          label: 'label',
          reducer: TimeSeriesReducers.SUM
        },
      }),
      [
        'TS.MREVRANGE', '-', '+', 'FILTER_BY_TS', '0', 'FILTER_BY_VALUE', '0', '1',
        'COUNT', '1', 'ALIGN', '-', 'AGGREGATION', 'AVG', '1', 'FILTER', 'label=value',
        'GROUPBY', 'label', 'REDUCE', 'SUM'
      ]
    );
  });

  testUtils.testWithClient('client.ts.mRevRange', async client => {
    const [, reply] = await Promise.all([
      client.ts.add('key', 0, 0, {
        LABELS: { label: 'value' }
      }),
      client.ts.mRevRange('-', '+', 'label=value', {
        COUNT: 1
      })
    ]);

    assert.deepEqual(reply, [{
      key: 'key',
      samples: [{
        timestamp: 0,
        value: 0
      }]
    }]);
  }, GLOBAL.SERVERS.OPEN);
});

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SimulatorMessage } from './SimulatorMessage';

describe('SimulatorMessage', () => {
  it('renders hints and coach notes separately from the spoken reply', () => {
    const markup = renderToStaticMarkup(
      <SimulatorMessage
        message={{
          role: 'assistant',
          content:
            '駅まで歩いて行けます。\n[HINT: You can walk to the station.]\n[COACH: use まで for a destination.]',
        }}
      />,
    );

    expect(markup).toContain('駅まで歩いて行けます。');
    expect(markup).toContain('You can walk to the station.');
    expect(markup).toContain('use まで for a destination.');
    expect(markup).not.toContain('[HINT:');
    expect(markup).not.toContain('[COACH:');
  });
});

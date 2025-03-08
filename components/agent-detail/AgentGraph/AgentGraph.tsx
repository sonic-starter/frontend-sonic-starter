import React from 'react';

interface AgentGraphProps {
  poolAddress: string;
  network: string;
}

const AgentGraph: React.FC<AgentGraphProps> = ({ poolAddress, network }) => {
  if (!poolAddress || !network)
    return <div> pool address and network is Missing.</div>;

  const geckoTerminalURL = `https://www.geckoterminal.com/${network}/pools/${poolAddress}?embed=1&info=0&swaps=1&grayscale=0&light_chart=0&chart_type=price&resolution=15m`;

  https: return (
    <div className='w-full h-[900px]'>
      <iframe
        id='geckoterminal-embed'
        title='GeckoTerminal Embed'
        src={geckoTerminalURL}
        width='100%'
        height='100%'
        frameBorder='0'
        allow='clipboard-write'
        allowFullScreen
      />
    </div>
  );
};

export default AgentGraph;

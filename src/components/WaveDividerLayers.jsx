import WaveDivider from './WaveDivider.jsx';
import './WaveDividerLayers.css';

function WaveDividerLayers({ fill = 'var(--color-orange)', flip = false }) {
  return (
    <div className="wave-layers">
      <WaveDivider fill={fill} flip={flip} opacity={0.35} delay={0.6} />
      <WaveDivider fill={fill} flip={flip} opacity={0.6} delay={0.3} />
      <WaveDivider fill={fill} flip={flip} />
    </div>
  );
}

export default WaveDividerLayers;

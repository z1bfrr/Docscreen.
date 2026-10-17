const fs = require('fs');
const path = require('path');

const svgDir = 'C:\\Users\\MukeshZ\\Documents\\PJS\\backend\\labe-mobile\\assets\\diagnostic_ios26_svg_icon_pack';
const outputFile = 'C:\\Users\\MukeshZ\\Documents\\PJS\\backend\\labe-mobile\\src\\components\\CustomIcons.tsx';

const files = fs.readdirSync(svgDir);
let components = '';

files.forEach(file => {
  if (!file.endsWith('.svg')) return;
  
  const filename = file.replace('.svg', '');
  
  const componentName = filename.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') + 'Icon';
  
  const content = fs.readFileSync(path.join(svgDir, file), 'utf8');
  
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 128 128';
  
  let innerContent = content.replace(/<svg[^>]*>|<\/svg>/g, '');
  innerContent = innerContent.replace(/<path/g, '<Path');
  innerContent = innerContent.replace(/<\/path>/g, '</Path>');
  innerContent = innerContent.replace(/<g/g, '<G');
  innerContent = innerContent.replace(/<\/g>/g, '</G>');
  
  innerContent = innerContent.replace(/<title>/g, '{/* ');
  innerContent = innerContent.replace(/<\/title>/g, ' */}');
  
  innerContent = innerContent.replace(/stroke-width/g, 'strokeWidth');
  innerContent = innerContent.replace(/stroke-linecap/g, 'strokeLinecap');
  innerContent = innerContent.replace(/stroke-linejoin/g, 'strokeLinejoin');
  innerContent = innerContent.replace(/"currentColor"/g, '{color}');
  
  components += `
export const ${componentName} = ({ color = 'black', size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="${viewBox}" fill="none" {...props}>
    ${innerContent}
  </Svg>
);
`;
});

const header = `import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

`;

fs.writeFileSync(outputFile, header + components);
console.log(`Generated icons to ${outputFile}`);

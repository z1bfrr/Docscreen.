import os
import glob
import re

svg_dir = r'C:\Users\MukeshZ\Documents\PJS\backend\labe-mobile\assets\diagnostic_ios26_svg_icon_pack'
output_file = r'C:\Users\MukeshZ\Documents\PJS\backend\labe-mobile\src\components\CustomIcons.tsx'

svg_files = glob.glob(os.path.join(svg_dir, '*.svg'))

components = []

for file_path in svg_files:
    filename = os.path.basename(file_path).replace('.svg', '')
    if filename == 'README.md': continue
    
    # convert kebab-case to PascalCase
    component_name = ''.join(word.capitalize() for word in filename.split('-')) + 'Icon'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract viewBox
    viewBox_match = re.search(r'viewBox="([^"]+)"', content)
    viewBox = viewBox_match.group(1) if viewBox_match else '0 0 24 24'
    
    # Extract inner content
    inner_content = re.sub(r'<svg[^>]*>|<\/svg>', '', content)
    
    # Capitalize tags
    inner_content = inner_content.replace('<path', '<Path')
    inner_content = inner_content.replace('</path>', '</Path>')
    inner_content = inner_content.replace('<g', '<G')
    inner_content = inner_content.replace('</g>', '</G>')
    inner_content = inner_content.replace('<title>', '{/* <title>')
    inner_content = inner_content.replace('</title>', '</title> */}')
    
    # React Native SVG properties
    inner_content = inner_content.replace('stroke-width', 'strokeWidth')
    inner_content = inner_content.replace('stroke-linecap', 'strokeLinecap')
    inner_content = inner_content.replace('stroke-linejoin', 'strokeLinejoin')
    
    components.append(f'''
export const {component_name} = ({{ color = 'black', size = 24, ...props }}: any) => (
  <Svg width={{size}} height={{size}} viewBox="{viewBox}" fill="none" {{...props}}>
    {{React.cloneElement(<>{inner_content}</>, {{ stroke: color }})}}
  </Svg>
);
''')

# Wait, cloning element might not work if it's raw text. Let's just wrap it in a root G element with the stroke.
# Better way:

components = []
for file_path in svg_files:
    filename = os.path.basename(file_path).replace('.svg', '')
    if filename == 'README.md': continue
    
    component_name = ''.join(word.capitalize() for word in filename.split('-')) + 'Icon'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    viewBox_match = re.search(r'viewBox="([^"]+)"', content)
    viewBox = viewBox_match.group(1) if viewBox_match else '0 0 128 128'
    
    inner_content = re.sub(r'<svg[^>]*>|<\/svg>', '', content)
    inner_content = inner_content.replace('<path', '<Path')
    inner_content = inner_content.replace('</path>', '</Path>')
    inner_content = inner_content.replace('<g', '<G')
    inner_content = inner_content.replace('</g>', '</G>')
    inner_content = inner_content.replace('<title>', '{/* ')
    inner_content = inner_content.replace('</title>', ' */}')
    
    inner_content = inner_content.replace('stroke-width', 'strokeWidth')
    inner_content = inner_content.replace('stroke-linecap', 'strokeLinecap')
    inner_content = inner_content.replace('stroke-linejoin', 'strokeLinejoin')
    inner_content = inner_content.replace('currentColor', '{color}')
    
    components.append(f'''
export const {component_name} = ({{ color = 'black', size = 24, ...props }}: any) => (
  <Svg width={{size}} height={{size}} viewBox="{viewBox}" fill="none" {{...props}}>
    {inner_content}
  </Svg>
);
''')


header = '''import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

'''

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(header + ''.join(components))

print(f"Generated {len(components)} icons to {output_file}")

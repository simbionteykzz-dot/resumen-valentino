import re

with open('Resumen.html', 'r', encoding='utf-8') as f:
    content = f.read()

styles = re.findall(r'<style.*?>(.*?)</style>', content, re.DOTALL | re.IGNORECASE)
scripts = re.findall(r'<script.*?>(.*?)</script>', content, re.DOTALL | re.IGNORECASE)

print('Number of style tags:', len(styles))
if styles:
    print('Length of first style:', len(styles[0]))

print('Number of script tags:', len(scripts))

html_without_style = re.sub(r'<style.*?>.*?</style>', '<link rel="stylesheet" href="style.css">', content, flags=re.DOTALL | re.IGNORECASE)
html_without_scripts = re.sub(r'<script.*?>.*?</script>', '<script src="script.js"></script>', html_without_style, flags=re.DOTALL | re.IGNORECASE)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_without_scripts)

if styles:
    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(styles[0].strip())

if scripts:
    with open('script.js', 'w', encoding='utf-8') as f:
        # Some scripts might be external or inline. We should be careful to only extract scripts without src.
        pass

# Let's inspect the script tags first
script_tags = re.findall(r'<script(.*?)>(.*?)</script>', content, re.DOTALL | re.IGNORECASE)
js_content = []
for attrs, body in script_tags:
    if 'src=' not in attrs.lower():
        js_content.append(body.strip())
    else:
        print("Found external script:", attrs)

if js_content:
    with open('script.js', 'w', encoding='utf-8') as f:
        f.write('\n\n'.join(js_content))

# Replace inline scripts with script.js, but keep external scripts
def replace_scripts(match):
    attrs = match.group(1)
    if 'src=' not in attrs.lower():
        return ''
    return match.group(0)

html_final = re.sub(r'<script(.*?)>.*?</script>', replace_scripts, html_without_style, flags=re.DOTALL | re.IGNORECASE)

# Insert <script src="script.js"></script> right before </body>
html_final = html_final.replace('</body>', '<script src="script.js"></script>\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_final)

print('Files separated successfully.')

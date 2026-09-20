#!/usr/bin/env python3
# Fix doble coma en i18n.ts (inserción automática)
p = '/home/z/my-project/src/lib/i18n.ts'
s = open(p).read()
n = s.count(',,')
s = s.replace(',,', ',')
open(p, 'w').write(s)
print(f'fixed {n} double commas')

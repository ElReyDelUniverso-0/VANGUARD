#!/bin/bash
# RONDA 18 — OLEADA A2: GITHUB PAGES (4 landing pages ES/EN/PT) + DISCUSSION
# Token scope=repo → pages y discussions sí; gists no (documentado).
T="$(cat /home/z/my-project/.ghtoken)"
API=https://api.github.com
OWNER=ElReyDelUniverso-0
REPO=VANGUARD
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== R18 WAVE A2 (Pages+Disc) $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

SHA=$(curl -s --max-time 20 -H "Authorization: Bearer $T" "$API/repos/$OWNER/$REPO/git/ref/heads/main" | python3 -c "import json,sys;print(json.load(sys.stdin)['object']['sha'])")
echo "[Pages-branch] main sha=$SHA" | tee -a "$LOG"

# crear rama gh-pages (si no existe)
BR=$(curl -s --max-time 20 -X POST "$API/repos/$OWNER/$REPO/git/refs" \
  -H "Authorization: Bearer $T" -H "Accept: application/vnd.github+json" \
  -d "{\"ref\":\"refs/heads/gh-pages\",\"sha\":\"$SHA\"}" -o /tmp/r18/br.json -w "%{http_code}")
echo "[Pages-branch] crear refs gh-pages → $BR $(cat /tmp/r18/br.json | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('message','OK')[:50])" 2>/dev/null)" | tee -a "$LOG"

put_page() { # $1=path(en repo) $2=archivo-local
  python3 -c "import json,sys,base64;p=json.dumps({'message':'R18 landing','content':base64.b64encode(open(sys.argv[1],'rb').read()).decode(),'branch':'gh-pages'});open('/tmp/r18/pp.json','w').write(p)" "$2"
  C=$(curl -s --max-time 30 -X PUT "$API/repos/$OWNER/$REPO/contents/$1" \
    -H "Authorization: Bearer $T" -H "Accept: application/vnd.github+json" \
    --data @/tmp/r18/pp.json -o /tmp/r18/ppr.json -w "%{http_code}")
  echo "[Page] $1 → $C" | tee -a "$LOG"
}

put_page "index.html" "/tmp/r18/site/index.html"
put_page "es/index.html" "/tmp/r18/site/es.html"
put_page "en/index.html" "/tmp/r18/site/en.html"
put_page "pt/index.html" "/tmp/r18/site/pt.html"

# habilitar Pages (source gh-pages /)
PG=$(curl -s --max-time 30 -X POST "$API/repos/$OWNER/$REPO/pages" \
  -H "Authorization: Bearer $T" -H "Accept: application/vnd.github+json" \
  -d '{"source":{"branch":"gh-pages","path":"/"}}' -o /tmp/r18/pg.json -w "%{http_code}")
echo "[Pages-enable] $PG $(python3 -c "import json;d=json.load(open('/tmp/r18/pg.json'));print(d.get('html_url') or d.get('message','')[:60])" 2>/dev/null)" | tee -a "$LOG"

# --- DISCUSSION (GraphQL) ---
NODEID=$(curl -s --max-time 20 -H "Authorization: Bearer $T" "$API/repos/$OWNER/$REPO" | python3 -c "import json,sys;print(json.load(sys.stdin)['node_id'])")
DISC=$(curl -s --max-time 30 -X POST "$API/graphql" -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d @- <<GQL
{"query":"mutation{updateRepository(input:{repositoryId:\\\"$NODEID\\\",hasDiscussionsEnabled:true}){repository{id,hasDiscussionsEnabled}}}"}
GQL
)
echo "[Disc-enable] $(echo $DISC | head -c 120)" | tee -a "$LOG"
CAT=$(curl -s --max-time 20 -X POST "$API/graphql" -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d @- <<GQL
{"query":"{repository(owner:\\\"$OWNER\\\",name:\\\"$REPO\\\"){discussionCategories(first:5){nodes{id,name}}}}"}
GQL
)
CATID=$(echo "$CAT" | python3 -c "import json,sys;d=json.load(sys.stdin);ns=d.get('data',{}).get('repository',{}).get('discussionCategories',{}).get('nodes',[]);print(next((n['id'] for n in ns if 'announ' in n['name'].lower() or 'general' in n['name'].lower()), ns[0]['id'] if ns else ''))" 2>/dev/null)
if [ -n "$CATID" ]; then
python3 -c "
import json,sys
body=open('/tmp/r18/disc.md').read()
q='''mutation(\$input: CreateDiscussionInput!){createDiscussion(input:\$input){discussion{url}}}'''
print(json.dumps({'query':q,'variables':{'input':{'repositoryId':'$NODEID','categoryId':'$CATID','title':'🎖️ VANGUARD v49.0 DIFUSIÓN 200 — juega gratis y ayuda a la misión','body':body}}}))
" > /tmp/r18/dq.json
DOUT=$(curl -s --max-time 30 -X POST "$API/graphql" -H "Authorization: Bearer $T" -H "Content-Type: application/json" --data @/tmp/r18/dq.json)
DU=$(echo "$DOUT" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('data',{}).get('createDiscussion',{}).get('discussion',{}).get('url') or ('ERR:'+str(d.get('errors'))[:80]))" 2>/dev/null)
echo "[Discussion] $DU" | tee -a "$LOG"
else
echo "[Discussion] ERR no category id" | tee -a "$LOG"
fi
echo "=== R18 WAVE A2 FIN ===" >> "$LOG"

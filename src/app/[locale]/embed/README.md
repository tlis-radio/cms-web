# Rádio TLIS - Embed Widgets

Embedovateľné widgety pre prehrávanie obsahu Rádia TLIS na externých webových stránkach.

## Dostupné widgety

### 1. Show List Widget

Zobrazí zoznam epizód relácie s integrovaným prehrávačom. Obsahuje hlavičku s názvom a obrázkom relácie.

**URL:** `/embed/show/[slug]`

**Príklad:**
```html
<iframe 
  src="https://tlis.sk/embed/show/nazov-relacie" 
  width="400" 
  height="600" 
  frameborder="0"
  allow="autoplay"
></iframe>
```

**Parametre:**
- `slug` - Slug relácie (napr. `alternativna-scena`, `jazz-klub`)

---

### 2. Episode Widget (Compact)

Kompaktný štvorcový widget pre jednu epizódu. Ideálny pre sidebar alebo menšie priestory.

**URL:** `/embed/episode/[id]`

**Príklad:**
```html
<iframe 
  src="https://tlis.sk/embed/episode/123" 
  width="350" 
  height="450" 
  frameborder="0"
  allow="autoplay"
></iframe>
```

**Parametre:**
- `id` - ID epizódy

---

### 3. Wide Episode Widget

Horizontálny widget pre jednu epizódu. Ideálny pre širšie priestory alebo ako inline prehrávač.

**URL:** `/embed/episode/[id]/wide`

**Príklad:**
```html
<iframe 
  src="https://tlis.sk/embed/episode/123/wide" 
  width="100%" 
  height="200" 
  frameborder="0"
  allow="autoplay"
></iframe>
```

**Parametre:**
- `id` - ID epizódy

---

## Použitie

### Základné vloženie

```html
<iframe 
  src="https://tlis.sk/embed/show/nazov-relacie" 
  width="400" 
  height="600" 
  frameborder="0"
  allow="autoplay"
  style="border-radius: 12px; overflow: hidden;"
></iframe>
```

### Responzívne vloženie

```html
<div style="position: relative; padding-bottom: 150%; height: 0; overflow: hidden;">
  <iframe 
    src="https://tlis.sk/embed/show/nazov-relacie" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
    allow="autoplay"
  ></iframe>
</div>
```

### Wide widget responzívne

```html
<div style="max-width: 600px; margin: 0 auto;">
  <iframe 
    src="https://tlis.sk/embed/episode/123/wide" 
    width="100%" 
    height="180" 
    frameborder="0"
    allow="autoplay"
    style="border-radius: 8px;"
  ></iframe>
</div>
```

---

## Funkcie

### Všetky widgety obsahujú:

- ✅ Prehrávač audio súborov
- ✅ Progress bar s možnosťou preskakovania
- ✅ Zobrazenie času prehrávania
- ✅ Responzívny dizajn
- ✅ Tmavý moderný vzhľad
- ✅ Odkaz na plnú stránku tlis.sk
- ✅ Media Session API (ovládanie cez OS)
- ✅ Počítanie vypočutí (po 5 minútach prehrávania)

### Show List Widget navyše:

- ✅ Hlavička s obrázkom a názvom relácie
- ✅ Počet epizód
- ✅ Fixný prehrávač na spodku
- ✅ Hover efekty na epizódach

---

## Odporúčané rozmery

| Widget | Šírka | Výška |
|--------|-------|-------|
| Show List | 350-450px | 500-700px |
| Episode (compact) | 300-400px | 400-500px |
| Episode (wide) | 400-800px | 150-200px |

---

## Podpora

Pre otázky alebo problémy kontaktujte tím Rádia TLIS.

---

## Changelog

### v1.0.0
- Prvá verzia embed widgetov
- Show List Widget
- Episode Widget (compact)
- Wide Episode Widget
- EmbedPlayerContext pre správu prehrávania

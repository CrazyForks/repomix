# Grundlegende Verwendung

## Schnellstart

Packen Sie Ihr gesamtes Repository:
```bash
repomix
```

## Häufige Anwendungsfälle

### Bestimmte Verzeichnisse packen
```bash
repomix path/to/directory
```

### Bestimmte Dateien einschließen
Verwenden Sie [Glob-Muster](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax):
```bash
repomix --include "src/**/*.ts,**/*.md"
```

### Dateien ausschließen
```bash
repomix --ignore "**/*.log,tmp/"
```

### Remote-Repositories
```bash
# Mit GitHub-URL
repomix --remote https://github.com/user/repo

# Mit Kurzform
repomix --remote user/repo

# Bestimmter Branch/Tag/Commit
repomix --remote user/repo --remote-branch main
repomix --remote user/repo --remote-branch 935b695
```

### Dateiliste-Eingabe (stdin)

Übergeben Sie Dateipfade über stdin für ultimative Flexibilität:

```bash
# Mit find-Befehl
find src -name "*.ts" -type f | repomix --stdin

# Mit Git für verfolgte Dateien
git ls-files "*.ts" | repomix --stdin

# Mit ripgrep (rg) zum Finden von Dateien
rg --files --type ts | repomix --stdin

# Mit grep zum Finden von Dateien mit bestimmten Inhalten
grep -l "TODO" **/*.ts | repomix --stdin

# Mit ripgrep zum Finden von Dateien mit bestimmten Inhalten
rg -l "TODO|FIXME" --type ts | repomix --stdin

# Mit sharkdp/fd zum Finden von Dateien
fd -e ts | repomix --stdin

# Mit fzf aus allen Dateien auswählen
fzf -m | repomix --stdin

# Interaktive Dateiauswahl mit fzf
find . -name "*.ts" -type f | fzf -m | repomix --stdin

# Mit ls und Glob-Mustern
ls src/**/*.ts | repomix --stdin

# Aus einer Datei mit Dateipfaden
cat file-list.txt | repomix --stdin

# Direkte Eingabe mit echo
echo -e "src/index.ts\nsrc/utils.ts" | repomix --stdin
```

Die `--stdin`-Option ermöglicht es Ihnen, eine Liste von Dateipfaden an Repomix zu übertragen und bietet ultimative Flexibilität bei der Auswahl der zu packenden Dateien.

Bei der Verwendung von `--stdin` werden die angegebenen Dateien effektiv zu den Include-Mustern hinzugefügt. Das bedeutet, dass das normale Include- und Ignore-Verhalten weiterhin gilt - über stdin angegebene Dateien werden trotzdem ausgeschlossen, wenn sie mit Ignore-Mustern übereinstimmen.

> [!NOTE]
> Bei der Verwendung von `--stdin` können Dateipfade relativ oder absolut angegeben werden, und Repomix übernimmt automatisch die Pfadauflösung und Deduplizierung.

### Code-Komprimierung

```bash
repomix --compress

# Sie können es auch mit Remote-Repositories verwenden:
repomix --remote yamadashy/repomix --compress
```

## Ausgabeformate

### XML (Standard)
```bash
repomix --style xml
```

### Markdown
```bash
repomix --style markdown
```

### Klartext
```bash
repomix --style plain
```

## Zusätzliche Optionen

### Kommentare entfernen
```bash
repomix --remove-comments
```

### Zeilennummern anzeigen
```bash
repomix --output-show-line-numbers
```

### In die Zwischenablage kopieren
```bash
repomix --copy
```

### Sicherheitsprüfung deaktivieren
```bash
repomix --no-security-check
```

## Konfiguration

Konfigurationsdatei initialisieren:
```bash
repomix --init
```

Siehe [Konfigurationsleitfaden](/de/guide/configuration) für detaillierte Optionen. 

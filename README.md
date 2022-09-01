<h1>Backend project level 3 (Load webpage on local storage)</h1>

### Hexlet tests and linter status:
[![Actions Status](https://github.com/fishtriangle/backend-project-lvl3/workflows/hexlet-check/badge.svg)](https://github.com/fishtriangle/backend-project-lvl3/actions)

### Code working tests and linter status:

[![Maintainability](https://api.codeclimate.com/v1/badges/b129906520da44735ddf/maintainability)](https://codeclimate.com/github/fishtriangle/backend-project-lvl3/maintainability)

[![Test Coverage](https://api.codeclimate.com/v1/badges/b129906520da44735ddf/test_coverage)](https://codeclimate.com/github/fishtriangle/backend-project-lvl3/test_coverage)

<hr>

### Asciinema logs:

### Example of run page-loader cli:
[![asciicast](https://asciinema.org/a/MLmwNhA4ymgQcoi4hA7jkEw2L.svg)](https://asciinema.org/a/MLmwNhA4ymgQcoi4hA7jkEw2L)

### Example of downloading page with pictures:
[![asciicast](https://asciinema.org/a/1R7KCopNNiamKWCbpatrXecPh.svg)](https://asciinema.org/a/1R7KCopNNiamKWCbpatrXecPh)

### Example of downloading webpage and files inside it:
[![asciicast](https://asciinema.org/a/CVdxe052S33cEp0X6kPCD2J1P.svg)](https://asciinema.org/a/CVdxe052S33cEp0X6kPCD2J1P)

### Example of debug mode:
[![asciicast](https://asciinema.org/a/kXUyiecK9vHdsxuiriHDHOvXl.svg)](https://asciinema.org/a/kXUyiecK9vHdsxuiriHDHOvXl)

### Handling errors tests:
[![asciicast](https://asciinema.org/a/nAEk1JPCiFCeVGnIzr8OOJrzI.svg)](https://asciinema.org/a/nAEk1JPCiFCeVGnIzr8OOJrzI)

### Page-loader with Listr download notification:
[![asciicast](https://asciinema.org/a/ZJoTxGME8KeWs2PdITKODHUu5.svg)](https://asciinema.org/a/ZJoTxGME8KeWs2PdITKODHUu5)


## Description
Third studying project created with node.js and makefile.
Download webpage on local storage and all additional files like: scripts, images, stylesheets.
Options: select webpage, select place to save.

## Requirements
<ul>
<li>Node.js</li>
<li>Makefile</li>
</ul>

## Installation
In project folder.
To install environment:
```
make install
```
To check is package correct:
```
make publish
```

To create local link:
```
npm link
```

## CLI-use
After installation:
```
page-loader https://page.to.download 
```

<br>
Options:

```
Usage: page-loader [options] <url>

Options:

-V, --version       output the version number                                                                                                                         
-o, --output <dir>  output dir (default: "/mnt/c/repository/backend-project-lvl3")                                                                                  
-h, --help          display help for command

```

## Additional scripts
Linter script:
```
make lint
```

Run tests:
```
make test
```

Run tests coverage:
```
make test-coverage
```

Run in debug mode:
```
make debug
```

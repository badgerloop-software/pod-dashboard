#!/usr/bin/env bash

function dbd() {
    # Help Prompt
    if [[ $# = 0 || $1 = "help" ]]; then
        echo "Usage:  ./dbd help                  -- See this prompt"
        echo "        ./dbd install               -- Install NPM dependencies"
	    echo "	      ./dbd suid-fix              -- Fixes SUID error on Linux - Requires sudo access"
        echo "        ./dbd build <app|html|css>  -- Build html, css, or both (builds app if none specified)"
        echo "        ./dbd lint                  -- Lint the source files"
        echo "        ./dbd run <|as-is|dev>      -- Run after building, run as-is, or run with continual building"
        return 0
    fi

    # Install
    if [[ $1 = "install" ]]; then
        npm install
        return $?
    fi

    # SUID Fix
    if [[ $1 = "install" ]]; then
        sudo chown root ./node_modules/electron/dist/chrome-sandbox && sudo chmod 4755 ./node_modules/electron/dist/chrome-sandbox
        return $?
    fi

    # Build
    if [[ $1 = "build" ]]; then
        # Build App (default)
        if [[ $2 = "app" || $# = 1 ]]; then
            echo "Building HTML and CSS"
            dbd build html
            dbd build css
            return 0
        fi
        
        # Build HTML
        if [[ $2 = "html" ]]; then
            ./node_modules/.bin/pug ./src/templates -P --out ./src/views-pug ${@:3}
            rm -rf ./src/views-pug/*/
            return $?
        fi

        # Build CSS
        if [[ $2 = "css" ]]; then
            ./node_modules/.bin/sass src/scss:src/public/css --no-source-map ${@:3}
            return $?
        fi
        
        if [[ $2 = "docs" ]]; then
            echo "Building documentation"
            ./node_modules/.bin/jsdoc ./src/ -R ./README.md -r -P ./package.json -t ./node_modules/docdash/ -c ./jsdoc.json -d ./docs/
            return $?
        fi

        # Unrecognized Build Option
        >&2 echo "Unrecognized build option '${2}'."
        dbd help
        return 1
    fi

    # Lint
    if [[ $1 = "lint" ]]; then
        eslint src
        return $?
    fi

    # Run
    if [[ $1 = "run" ]]; then
        # Run as-is
        if [[ $# = 1 ]]; then
            dbd build app
            ./node_modules/.bin/electron .
            return $?
        fi

        # Run as-is
        if [[ $2 = "as-is" ]]; then
            ./node_modules/.bin/electron .
            return $?
        fi

        # Run in development mode
        if [[ $2 = "dev" ]]; then
            (dbd build html --watch) &
            echo "Watching for HTML changes."
            
            (dbd build css --watch) &
            echo "Watching for CSS changes."

            # Run electron with debug mode
            DEBUG='true'
            dbd run as-is

            # Ignore interupts
            trap '' INT

            # Interrupt everything else in current group
            kill -2 -$(ps -p $$ | tail -1 | awk '{ print $3; }')

            # Reset interupt trap
            trap - INT

            echo "Goodbye."
            return $?
        fi

        # Unrecognized Run Option
        >&2 echo "Unrecognized run option '${2}'."
        dbd help
        return 1
    fi

    # Unrecognized Option
    >&2 echo "Unrecognized option '${1}'."
    dbd help
    return 1
}

# Change to the appropriate directory
cd $(dirname $0)
# cd "$(dirname "$(npm root)")" // Portable Version

# Ensure we are in a valid directory
if test -f "package.json" && (cat "package.json" | head -2 | tail -1 | grep -q "dashboard"); then 
    (cd ..)
else
    >&2 echo "Fatal: Not in a dashboard directory (or in any child directory)."
    return 1
fi

# Run the dbd function
dbd $@

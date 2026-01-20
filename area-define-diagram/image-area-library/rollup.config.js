// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';

const packageJson = require('./package.json');

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: packageJson.main,
                format: 'cjs',
                sourcemap: false,
                name: 'image-area-library'
            },
            {
                file: packageJson.module,
                format: 'esm',
                sourcemap: false
            }
        ],
        plugins: [
            external(),
            resolve(),
            commonjs(),
            typescript({ tsconfig: './tsconfig.json' }),
            postcss({
                config: { path :'./postcss.config.js' },
                extensions: ['.scss'],
                minimize: true,
                inject: {  insertAt: 'top' },
            }),
            terser(),
        ],
        external: [
            "react", "react-dom", "styled-components",
            "react-konva-utils", "lodash", "react-konva",
            "konva", "react-router-dom"
        ],
    },
    {
        input: 'dist/esm/index.d.ts',
        output: [{ file: 'dist/index.d.ts', format: "esm" }],
        external: [/\.scss$/],
        plugins: [dts()],
    },
]

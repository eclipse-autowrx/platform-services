// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { IRectangle } from './bc-rectangle';
import { IEllipse } from './bc-ellipse';
import { IBCShapeIcon } from './bc-shape-icon';
import { IBCText } from './bc-text';
import { SHAPE } from './constant';

export type ITypeShape = typeof SHAPE[ keyof typeof SHAPE ];
export type IAllShape = IRectangle | IEllipse | IBCShapeIcon | IBCText;
export interface IShape {
    id?: string;
    type: ITypeShape;
    x?: number; // left
    y?: number; // top
    hoverMessage?: string;
    url?: string;
    isFocus?: boolean;
    viewOnly?: boolean;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    onSelectedShape?: ( shape: IAllShape ) => void;
    onChangePointer?: ( cursor?: string ) => void;
    onShapeActionStart?: () => void;
    onShapeActionEnd?: ( shape: IAllShape, isClose?: boolean ) => void;
    navigate?: ( url: string ) => void;
}
export { default as BCRectangle } from './bc-rectangle';
export type { IRectangle } from './bc-rectangle';
export { default as BCEllipse } from './bc-ellipse';
export type { IEllipse } from './bc-ellipse';
export { default as BCText } from './bc-text';
export type { IBCText } from './bc-text';
export { default as BCShapeIcon } from './bc-shape-icon';
export type { IBCShapeIcon } from './bc-shape-icon';
// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import { BCDrawArea } from '../draw-area';
import { IShape } from '../shapes';

interface IImageAreaPreview {
    shapes?: IShape[];
    bgImage?: string;
    bgColor?: string;
    navigate?: ( url: string ) => void;
}

const ImageAreaPreview = ( props: IImageAreaPreview ) => {

    const { shapes, bgImage, bgColor, navigate } = props;

    /**
     * useState
     */
    const [ displayShapes, setDisplayShapes ] = useState<IShape[]>();
    const [ displayBgColor, setDisplayBgColor ] = useState<string>();

    /**
     * useEffect
     */
    useEffect( () => setDisplayShapes( shapes?.length > 0 ? shapes : [] ), [ shapes ] );
    useEffect( () => setDisplayBgColor( bgColor ), [ bgColor ] );

    return (
        <div className="flex w-full h-full">
            <BCDrawArea
                viewOnly={true}
                displayShapes={displayShapes}
                bgImage={bgImage}
                displayBgColor={displayBgColor}
                navigate={navigate}
            />
        </div>
    );
}

export default ImageAreaPreview;
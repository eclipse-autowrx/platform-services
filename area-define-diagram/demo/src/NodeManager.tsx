// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useEffect, useState } from "react";
import axios from 'axios'
import { useSearchParams } from 'react-router-dom';

const PROJECT_ID = "demo";
const MASTER_ITEM = "master";
const DB_URL = "https://lightdb.digitalauto.tech"

const NodeManager = ({onNodeIdChanged}) => {
    const [searchParams] = useSearchParams();

    const [nodes, setNodes] = useState<any[]>([])
    const [activeNodeId, setActiveNodeId] = useState<string>("");

    useEffect(() => {
        listAllNode()
    }, []);

    useEffect(() => {
        let id = searchParams.get('id')
        console.log(`id: ${id}`)
        if(id) {
            setActiveNodeId(id)
        }
    }, [searchParams])

    useEffect(() => {
        // if(!activeNodeId) {
        //     if(nodes && nodes.length > 0) {
        //         let masterItem = nodes.find(item => item.parent_id == MASTER_ITEM)
        //         if(masterItem) {
        //             setActiveNodeId(masterItem._id)
        //         }
        //     }
        //     else {
        //         createNewNode(true)
        //     }
        //     return
        // }
        if(onNodeIdChanged) {
            onNodeIdChanged(activeNodeId)
        }
    }, [activeNodeId, nodes])

    const copyTextToClipboard = async (text) => {
        if ('clipboard' in navigator) {
            return await navigator.clipboard.writeText(text);
        } else {
            return document.execCommand('copy', true, text);
        }
    }

    const listAllNode = async () => {
        console.log(`listAllNode`)
        // setNodes([])
        try {
            let res = await axios.get(`${DB_URL}/project/${PROJECT_ID}/item/listAll`)
            if(res.data && res.data.status == "OK" && res.data.content) {
                let tmpNodes = res.data.content
                let masterItem = tmpNodes.find(item => item.parent_id == MASTER_ITEM)
                if(masterItem) {
                    setActiveNodeId(masterItem._id)
                } else {
                    await createNewNode(true)
                }
                setNodes(tmpNodes)
            }
        } catch(err){
            console.log(err)
        }
    }

    const createNewNode = async (isMaster:boolean) => {
        let newNode = {
            name: "Node " + (nodes.length + 1),
            type: "node",
            parent_id: isMaster?MASTER_ITEM:'NAN',
            project_id: PROJECT_ID,
            content: {
                bgImage: '',
                shapes: []
            }
        }
        try {
            await axios.post(`${DB_URL}/project/${PROJECT_ID}/item`, newNode)
            await listAllNode()
        } catch(err) {
            console.log(err)
        }
        return null
    }

    return <div className="w-full h-full">
        <div className="bg-slate-200 flex text-slate-700 py-1 px-4 font-bold">
            <div className="grow">List of Node</div>
            <div className="text-sky-600 px-2 font-bold text-sm cursor-pointer hover:bg-slate-300"
                onClick={() => { createNewNode(false) }}>
                New Node</div>
        </div>
        <div className="overflow-auto h-full">
            {
                nodes && nodes.map(node => <div key={node._id} 
                    onClick={() => { setActiveNodeId(node._id) }}
                    className={`px-2 py-1 cursor-pointer hover:bg-slate-100 border-b ${(activeNodeId==node._id) && 'bg-slate-100'}`}>
                    <div className="text-sm font-bold text-slate-700">{node.name}</div>
                    <div className="flex">
                        <div className="text-xs text-gray-500 italic grow">{node._id}</div>
                        <div className="text-slate-700 text-xs font-bold px-2 hover:bg-slate-200"
                            onClick={(event) => {
                                copyTextToClipboard(`/?id=${node._id}`)
                                if (event.stopPropagation) {
                                    event.stopPropagation();   // W3C model
                                }
                            }}
                            >Copy</div>
                    </div>
                </div>)
            }
        </div>
    </div>
}

export default NodeManager
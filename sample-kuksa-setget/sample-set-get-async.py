
# Copyright (c) 2025 Eclipse Foundation.
# 
# This program and the accompanying materials are made available under the
# terms of the MIT License which is available at
# https://opensource.org/licenses/MIT.
#
# SPDX-License-Identifier: MIT

import asyncio

from kuksa_client.grpc.aio import VSSClient
from kuksa_client.grpc import Datapoint

BORKER_IP = '192.168.1.55'
BROKER_PORT = 6111



async def main():
    client = VSSClient(BORKER_IP, BROKER_PORT)
    # async with VSSClient(BORKER_IP, BROKER_PORT) as client:
    values = await client.get_target_values(['Vehicle.Body.Lights.IsLowBeamOn'])
    for i in range(10):
        await client.set_target_values({
            'Vehicle.Body.Lights.IsLowBeamOn': Datapoint(True),
        })
        await asyncio.sleep(1)
        await client.set_target_values({
            'Vehicle.Body.Lights.IsLowBeamOn': Datapoint(False),
        })
        await asyncio.sleep(1)

asyncio.run(main())
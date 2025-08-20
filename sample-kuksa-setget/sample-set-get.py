

# Copyright (c) 2025 Eclipse Foundation.
# 
# This program and the accompanying materials are made available under the
# terms of the MIT License which is available at
# https://opensource.org/licenses/MIT.
#
# SPDX-License-Identifier: MIT

from kuksa_client.grpc import Datapoint
from kuksa_client.grpc import VSSClient

BORKER_IP = '127.0.0.1'
BROKER_PORT = 6111

client = VSSClient(BORKER_IP, BROKER_PORT)

# with VSSClient(BORKER_IP, BROKER_PORT) as client:
values = client.get_target_values(['Vehicle.Body.Lights.IsLowBeamOn'])
for i in range(10):
    
    client.set_target_values({
        'Vehicle.Body.Lights.IsLowBeamOn': Datapoint(True),
    })
    
    client.set_target_values({
        'Vehicle.Body.Lights.IsLowBeamOn': Datapoint(False),
    })
import { AgentV2 } from "@mrcodetol/core/agent"
import { AISDK } from "@mrcodetol/core/aisdk"
import { Catalog } from "@mrcodetol/core/catalog"
import { CommandV2 } from "@mrcodetol/core/command"
import { Credential } from "@mrcodetol/core/credential"
import { AppNodeBuilder } from "@mrcodetol/core/effect/app-node-builder"
import { LayerNodePlatform } from "@mrcodetol/core/effect/app-node-platform"
import { LayerNode } from "@mrcodetol/core/effect/layer-node"
import { EventV2 } from "@mrcodetol/core/event"
import { FileSystem } from "@mrcodetol/core/filesystem"
import { FSUtil } from "@mrcodetol/core/fs-util"
import { Integration } from "@mrcodetol/core/integration"
import { Location } from "@mrcodetol/core/location"
import { Npm } from "@mrcodetol/core/npm"
import { PluginV2 } from "@mrcodetol/core/plugin"
import { Reference } from "@mrcodetol/core/reference"
import { SkillV2 } from "@mrcodetol/core/skill"
import { Effect, Layer } from "effect"
import { tempLocationLayer } from "../fixture/location"

const npmLayer = Layer.succeed(
  Npm.Service,
  Npm.Service.of({
    add: () => Effect.succeed({ directory: "", entrypoint: undefined }),
    install: () => Effect.void,
    which: () => Effect.succeed(undefined),
  }),
)

export const PluginTestLayer = AppNodeBuilder.build(
  LayerNode.group([
    FileSystem.node,
    FSUtil.node,
    Location.node,
    Npm.node,
    Credential.node,
    EventV2.node,
    LayerNodePlatform.httpClient,
    PluginV2.node,
    AgentV2.node,
    AISDK.node,
    Catalog.node,
    CommandV2.node,
    Integration.node,
    Reference.node,
    SkillV2.node,
  ]),
  [
    [Location.node, tempLocationLayer],
    [Npm.node, npmLayer],
  ],
)

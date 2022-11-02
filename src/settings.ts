// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import vscode = require("vscode");
import utils = require("./utils");
import os = require("os");
import { Logger } from "./logging";

export interface ISettings {
    powerShellAdditionalExePaths: IPowerShellAdditionalExePathSettings;
    powerShellDefaultVersion: string;
    // This setting is no longer used but is here to assist in cleaning up the users settings.
    powerShellExePath: string;
    promptToUpdatePowerShell: boolean;
    startAsLoginShell: IStartAsLoginShellSettings;
    startAutomatically: boolean;
    enableProfileLoading: boolean;
    helpCompletion: string;
    scriptAnalysis: IScriptAnalysisSettings;
    debugging: IDebuggingSettings;
    developer: IDeveloperSettings;
    codeFolding: ICodeFoldingSettings;
    codeFormatting: ICodeFormattingSettings;
    integratedConsole: IIntegratedConsoleSettings;
    bugReporting: IBugReportingSettings;
    sideBar: ISideBarSettings;
    pester: IPesterSettings;
    buttons: IButtonSettings;
    cwd: string;
    enableReferencesCodeLens: boolean;
    analyzeOpenDocumentsOnly: boolean;
    // TODO: Add (deprecated) useX86Host (for testing)
}

export enum CodeFormattingPreset {
    Custom = "Custom",
    Allman = "Allman",
    OTBS = "OTBS",
    Stroustrup = "Stroustrup",
}

export enum PipelineIndentationStyle {
    IncreaseIndentationForFirstPipeline = "IncreaseIndentationForFirstPipeline",
    IncreaseIndentationAfterEveryPipeline = "IncreaseIndentationAfterEveryPipeline",
    NoIndentation = "NoIndentation",
    None = "None",
}

export enum LogLevel {
    Diagnostic = "Diagnostic",
    Verbose = "Verbose",
    Normal = "Normal",
    Warning = "Warning",
    Error = "Error",
    None = "None",
}

export enum CommentType {
    Disabled = "Disabled",
    BlockComment = "BlockComment",
    LineComment = "LineComment",
}

export type IPowerShellAdditionalExePathSettings = Record<string, string>;

export interface IBugReportingSettings {
    project: string;
}

export interface ICodeFoldingSettings {
    enable: boolean;
    showLastLine: boolean;
}

export interface ICodeFormattingSettings {
    autoCorrectAliases: boolean;
    avoidSemicolonsAsLineTerminators: boolean;
    preset: CodeFormattingPreset;
    openBraceOnSameLine: boolean;
    newLineAfterOpenBrace: boolean;
    newLineAfterCloseBrace: boolean;
    pipelineIndentationStyle: PipelineIndentationStyle;
    whitespaceBeforeOpenBrace: boolean;
    whitespaceBeforeOpenParen: boolean;
    whitespaceAroundOperator: boolean;
    whitespaceAfterSeparator: boolean;
    whitespaceBetweenParameters: boolean;
    whitespaceInsideBrace: boolean;
    addWhitespaceAroundPipe: boolean;
    trimWhitespaceAroundPipe: boolean;
    ignoreOneLineBlock: boolean;
    alignPropertyValuePairs: boolean;
    useConstantStrings: boolean;
    useCorrectCasing: boolean;
}

export interface IScriptAnalysisSettings {
    enable: boolean;
    settingsPath: string;
}

export interface IDebuggingSettings {
    createTemporaryIntegratedConsole: boolean;
}

export interface IDeveloperSettings {
    featureFlags: string[];
    bundledModulesPath: string;
    editorServicesLogLevel: LogLevel;
    editorServicesWaitForDebugger: boolean;
    waitForSessionFileTimeoutSeconds: number;
}

export interface IStartAsLoginShellSettings {
    osx: boolean;
    linux: boolean;
}

export interface IIntegratedConsoleSettings {
    showOnStartup: boolean;
    startInBackground: boolean;
    focusConsoleOnExecute: boolean;
    useLegacyReadLine: boolean;
    forceClearScrollbackBuffer: boolean;
    suppressStartupBanner: boolean;
}

export interface ISideBarSettings {
    // TODO: add CommandExplorerExcludeFilter
    CommandExplorerVisibility: boolean;
}

export interface IPesterSettings {
    // TODO: add codeLens property
    useLegacyCodeLens: boolean;
    outputVerbosity: string;
    debugOutputVerbosity: string;
}

export interface IButtonSettings {
    showRunButtons: boolean;
    showPanelMovementButtons: boolean;
}

export function getDefaultSettings() {
    const defaultBugReportingSettings: IBugReportingSettings = {
        project: "https://github.com/PowerShell/vscode-powershell",
    };

    const defaultScriptAnalysisSettings: IScriptAnalysisSettings = {
        enable: true,
        settingsPath: "PSScriptAnalyzerSettings.psd1",
    };

    const defaultDebuggingSettings: IDebuggingSettings = {
        createTemporaryIntegratedConsole: false,
    };

    const defaultDeveloperSettings: IDeveloperSettings = {
        featureFlags: [],
        // From `<root>/out/main.js` we go to the directory before <root> and
        // then into the other repo.
        bundledModulesPath: "../../PowerShellEditorServices/module",
        editorServicesLogLevel: LogLevel.Normal,
        editorServicesWaitForDebugger: false,
        waitForSessionFileTimeoutSeconds: 240,
    };

    const defaultCodeFoldingSettings: ICodeFoldingSettings = {
        enable: true,
        showLastLine: true,
    };

    const defaultCodeFormattingSettings: ICodeFormattingSettings = {
        autoCorrectAliases: false,
        avoidSemicolonsAsLineTerminators: false,
        preset: CodeFormattingPreset.Custom,
        openBraceOnSameLine: true,
        newLineAfterOpenBrace: true,
        newLineAfterCloseBrace: true,
        pipelineIndentationStyle: PipelineIndentationStyle.NoIndentation,
        whitespaceBeforeOpenBrace: true,
        whitespaceBeforeOpenParen: true,
        whitespaceAroundOperator: true,
        whitespaceAfterSeparator: true,
        whitespaceBetweenParameters: false,
        whitespaceInsideBrace: true,
        addWhitespaceAroundPipe: true,
        trimWhitespaceAroundPipe: false,
        ignoreOneLineBlock: true,
        alignPropertyValuePairs: true,
        useConstantStrings: false,
        useCorrectCasing: false,
    };

    // We follow the same convention as VS Code - https://github.com/microsoft/vscode/blob/ff00badd955d6cfcb8eab5f25f3edc86b762f49f/src/vs/workbench/contrib/terminal/browser/terminal.contribution.ts#L105-L107
    //   "Unlike on Linux, ~/.profile is not sourced when logging into a macOS session. This
    //   is the reason terminals on macOS typically run login shells by default which set up
    //   the environment. See http://unix.stackexchange.com/a/119675/115410"
    const defaultStartAsLoginShellSettings: IStartAsLoginShellSettings = {
        osx: true,
        linux: false,
    };

    const defaultIntegratedConsoleSettings: IIntegratedConsoleSettings = {
        showOnStartup: true,
        startInBackground: false,
        focusConsoleOnExecute: true,
        useLegacyReadLine: false,
        forceClearScrollbackBuffer: false,
        suppressStartupBanner: false,
    };

    const defaultSideBarSettings: ISideBarSettings = {
        CommandExplorerVisibility: true,
    };

    const defaultButtonSettings: IButtonSettings = {
        showRunButtons: true,
        showPanelMovementButtons: false
    };

    const defaultPesterSettings: IPesterSettings = {
        useLegacyCodeLens: true,
        outputVerbosity: "FromPreference",
        debugOutputVerbosity: "Diagnostic",
    };

    const defaultSettings: ISettings = {
        startAutomatically: true,
        powerShellAdditionalExePaths: {},
        powerShellDefaultVersion: "",
        powerShellExePath: "",
        promptToUpdatePowerShell: true,
        enableProfileLoading: true,
        helpCompletion: CommentType.BlockComment,
        scriptAnalysis: defaultScriptAnalysisSettings,
        debugging: defaultDebuggingSettings,
        developer: defaultDeveloperSettings,
        codeFolding: defaultCodeFoldingSettings,
        codeFormatting: defaultCodeFormattingSettings,
        integratedConsole: defaultIntegratedConsoleSettings,
        bugReporting: defaultBugReportingSettings,
        sideBar: defaultSideBarSettings,
        pester: defaultPesterSettings,
        buttons: defaultButtonSettings,
        startAsLoginShell: defaultStartAsLoginShellSettings,
        cwd: "",
        enableReferencesCodeLens: true,
        analyzeOpenDocumentsOnly: false,
    };

    return defaultSettings;
}

// This is a recursive function which unpacks a WorkspaceConfiguration into our settings.
function getSetting<TSetting>(key: string | undefined, value: TSetting, configuration: vscode.WorkspaceConfiguration): TSetting {
    // Base case where we're looking at a primitive type (or our special record).
    if (key !== undefined && (typeof (value) !== "object" || key === "powerShellAdditionalExePaths")) {
        return configuration.get<TSetting>(key, value);
    }

    // Otherwise we're looking at one of our interfaces and need to extract.
    for (const property in value) {
        const subKey = key !== undefined ? `${key}.${property}` : property;
        value[property] = getSetting(subKey, value[property], configuration);
    }

    return value;
}

export function getSettings(): ISettings {
    const configuration: vscode.WorkspaceConfiguration =
        vscode.workspace.getConfiguration(utils.PowerShellLanguageId);

    return getSetting(undefined, getDefaultSettings(), configuration);
}

// Get the ConfigurationTarget (read: scope) of where the *effective* setting value comes from
export function getEffectiveConfigurationTarget(settingName: string): vscode.ConfigurationTarget | undefined {
    const configuration = vscode.workspace.getConfiguration(utils.PowerShellLanguageId);
    const detail = configuration.inspect(settingName);
    if (detail === undefined) {
        return undefined;
    } else if (typeof detail.workspaceFolderValue !== "undefined") {
        return vscode.ConfigurationTarget.WorkspaceFolder;
    }
    else if (typeof detail.workspaceValue !== "undefined") {
        return vscode.ConfigurationTarget.Workspace;
    }
    else if (typeof detail.globalValue !== "undefined") {
        return vscode.ConfigurationTarget.Global;
    }
    return undefined;
}

export async function changeSetting(
    settingName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newValue: any,
    configurationTarget: vscode.ConfigurationTarget | boolean | undefined,
    logger: Logger | undefined): Promise<void> {

    logger?.writeDiagnostic(`Changing '${settingName}' at scope '${configurationTarget} to '${newValue}'`);

    try {
        const configuration = vscode.workspace.getConfiguration(utils.PowerShellLanguageId);
        await configuration.update(settingName, newValue, configurationTarget);
    } catch (err) {
        logger?.writeError(`Failed to change setting: ${err}`);
    }
}

// We don't want to query the user more than once, so this is idempotent.
let hasPrompted = false;

export async function validateCwdSetting(logger: Logger): Promise<string> {
    let cwd = vscode.workspace.getConfiguration(utils.PowerShellLanguageId).get<string | undefined>("cwd");

    // Only use the cwd setting if it exists.
    if (cwd !== undefined && await utils.checkIfDirectoryExists(cwd)) {
        return cwd;
    }

    // If there is no workspace, or there is but it has no folders, fallback.
    if (vscode.workspace.workspaceFolders === undefined
        || vscode.workspace.workspaceFolders.length === 0) {
        cwd = undefined;
        // If there is exactly one workspace folder, use that.
    } else if (vscode.workspace.workspaceFolders.length === 1) {
        cwd = vscode.workspace.workspaceFolders[0].uri.fsPath;
        // If there is more than one workspace folder, prompt the user once.
    } else if (vscode.workspace.workspaceFolders.length > 1 && !hasPrompted) {
        hasPrompted = true;
        const options: vscode.WorkspaceFolderPickOptions = {
            placeHolder: "Select a folder to use as the PowerShell extension's working directory.",
        };
        cwd = (await vscode.window.showWorkspaceFolderPick(options))?.uri.fsPath;
        // Save the picked 'cwd' to the workspace settings.
        // We have to check again because the user may not have picked.
        if (cwd !== undefined && await utils.checkIfDirectoryExists(cwd)) {
            await changeSetting("cwd", cwd, undefined, logger);
        }
    }

    // If there were no workspace folders, or somehow they don't exist, use
    // the home directory.
    if (cwd === undefined || !await utils.checkIfDirectoryExists(cwd)) {
        return os.homedir();
    }
    return cwd;
}

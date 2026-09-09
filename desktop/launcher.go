//go:build windows

package main

import (
    "fmt"
    "net/url"
    "os"
    "os/exec"
    "path/filepath"
    "syscall"
    "unsafe"
)

const appVersion = "0.27.2"

// Este launcher NÃO embute, extrai, baixa ou altera os arquivos do jogo.
// Ele apenas abre app/index.html, que fica ao lado do executável, em modo app
// do Edge/Chrome. O perfil do navegador continua em %APPDATA%/CatoonsTD/Runtime
// para preservar o save local das builds desktop anteriores.

func messageBox(title, message string) {
    user32 := syscall.NewLazyDLL("user32.dll")
    proc := user32.NewProc("MessageBoxW")
    t, _ := syscall.UTF16PtrFromString(title)
    m, _ := syscall.UTF16PtrFromString(message)
    proc.Call(0, uintptr(unsafe.Pointer(m)), uintptr(unsafe.Pointer(t)), 0x10)
}

func exists(path string) bool {
    if path == "" {
        return false
    }
    st, err := os.Stat(path)
    return err == nil && !st.IsDir()
}

func findBrowser() (string, string) {
    pf := os.Getenv("ProgramFiles")
    pfx86 := os.Getenv("ProgramFiles(x86)")
    local := os.Getenv("LOCALAPPDATA")

    candidates := []struct {
        name string
        path string
    }{
        {"Microsoft Edge", filepath.Join(pfx86, "Microsoft", "Edge", "Application", "msedge.exe")},
        {"Microsoft Edge", filepath.Join(pf, "Microsoft", "Edge", "Application", "msedge.exe")},
        {"Microsoft Edge", filepath.Join(local, "Microsoft", "Edge", "Application", "msedge.exe")},
        {"Google Chrome", filepath.Join(pf, "Google", "Chrome", "Application", "chrome.exe")},
        {"Google Chrome", filepath.Join(pfx86, "Google", "Chrome", "Application", "chrome.exe")},
        {"Google Chrome", filepath.Join(local, "Google", "Chrome", "Application", "chrome.exe")},
    }

    for _, c := range candidates {
        if exists(c.path) {
            return c.path, c.name
        }
    }

    for _, name := range []string{"msedge.exe", "chrome.exe"} {
        if p, err := exec.LookPath(name); err == nil {
            return p, name
        }
    }
    return "", ""
}

func main() {
    exePath, err := os.Executable()
    if err != nil {
        messageBox("Catoons TD", "Não foi possível localizar a pasta do jogo.")
        return
    }

    root := filepath.Dir(exePath)
    indexPath := filepath.Join(root, "app", "index.html")
    if !exists(indexPath) {
        messageBox("Catoons TD", "Arquivo app\\index.html não encontrado.\n\nMantenha o CatoonsTD.exe junto da pasta app.")
        return
    }

    browser, browserName := findBrowser()
    if browser == "" {
        messageBox("Catoons TD", "Catoons TD precisa do Microsoft Edge ou Google Chrome instalado como motor de renderização.")
        return
    }

    abs, err := filepath.Abs(indexPath)
    if err != nil {
        messageBox("Catoons TD", "Não foi possível preparar o endereço local do jogo.")
        return
    }

    // url.URL faz o escaping de espaços e caracteres especiais sem shell/PowerShell.
    uri := (&url.URL{Scheme: "file", Path: filepath.ToSlash(abs)}).String()

    args := []string{
        "--app=" + uri,
        "--start-maximized",
        "--no-first-run",
        "--disable-session-crashed-bubble",
    }

    // Mantém o mesmo perfil desktop já usado pelas builds anteriores para que o
    // localStorage (nível, moedas, estrelas e inventário) continue disponível.
    if appData := os.Getenv("APPDATA"); appData != "" {
        args = append(args, "--user-data-dir="+filepath.Join(appData, "CatoonsTD", "Runtime"))
    }

    cmd := exec.Command(browser, args...)
    if err := cmd.Start(); err != nil {
        messageBox("Catoons TD", fmt.Sprintf("Não foi possível iniciar o jogo usando %s.\n\n%s", browserName, err.Error()))
        return
    }
}

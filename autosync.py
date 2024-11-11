import pty
import os
import subprocess

def run_with_pty():
    pid, fd = pty.fork()
    if pid == 0:  # Child process
        os.execvp("git-auto-sync", ["git-auto-sync", "sync"])
    else:  # Parent process
        while True:
            output = os.read(fd, 1024).decode()
            if "Username for 'https://github.com'" in output:
                os.write(fd, b"dionma2020@gmail.com\n")
            elif "Password for 'https://dionma2020@gmail.com@github.com" in output:
                os.write(fd, b"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\n")
            print(output)

if __name__ == "__main__":
    run_with_pty()

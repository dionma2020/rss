import pexpect
import time
import os

def run_git_sync():
    target_directory = "/home/dion/Desktop/Pager/rss"
    
    try:
        # Change to the target directory
        os.chdir(target_directory)
        print(f"Changed to directory: {os.getcwd()}")  # Logging to confirm directory change

        while True:
            try:
                # Spawn the git-auto-sync command in the specified directory
                process = pexpect.spawn("git-auto-sync sync", cwd=target_directory)

                # Logging to help debug
                print("Running 'git-auto-sync sync'...")

                # Provide first username
                process.expect("username:")
                process.sendline("dionma2020@gmail.com")

                # Provide first password
                process.expect("password:")
                process.sendline("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")

                # Provide second username
                process.expect("username:")
                process.sendline("dionma2020@gmail.com")

                # Provide second password
                process.expect("password:")
                process.sendline("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")

                # Allow process to complete
                process.interact()
            except pexpect.EOF:
                print("Process finished.")
            except pexpect.TIMEOUT:
                print("Process timed out.")
            
            # Wait 1 second before running again
            time.sleep(1)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_git_sync()

#!/usr/bin/env python3
"""Daemonize VANGUARD: double-fork a command so it escapes the tool reaper.

Usage: python3 daemonize.py --name gs --log /tmp/gs.log --pidfile /tmp/gs.pid -- bun --hot index.ts
Run from the target working directory (cwd is inherited).
"""
import argparse
import os
import sys


def daemonize(cmd, log_path, pidfile):
    # 1st fork
    pid = os.fork()
    if pid > 0:
        os.waitpid(pid, 0)  # reap the intermediate child
        return
    os.setsid()  # new session, escape process group
    # 2nd fork: session leader no longer tracks us
    pid2 = os.fork()
    if pid2 > 0:
        os._exit(0)

    # fully detach stdio
    sys.stdout.flush()
    sys.stderr.flush()
    devnull = os.open(os.devnull, os.O_RDONLY)
    logfd = os.open(log_path, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o644)
    os.dup2(devnull, 0)
    os.dup2(logfd, 1)
    os.dup2(logfd, 2)
    os.close(devnull)

    if pidfile:
        with open(pidfile, "w") as f:
            f.write(str(os.getpid()))

    os.execvp(cmd[0], cmd)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--log", required=True)
    ap.add_argument("--pidfile", default=None)
    ap.add_argument("cmd", nargs="+")
    args = ap.parse_args()
    daemonize(args.cmd, args.log, args.pidfile)


if __name__ == "__main__":
    main()

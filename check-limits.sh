#!/bin/bash
echo "=== Container Resource Limits ==="
echo "Memory limit:"
cat /sys/fs/cgroup/memory/memory.limit_in_bytes 2>/dev/null || echo "Not available"
echo ""
echo "CPU quota:"
cat /sys/fs/cgroup/cpu/cpu.cfs_quota_us 2>/dev/null || echo "Not available"
echo ""
echo "Disk space:"
df -h /workspace 2>/dev/null || echo "Not available"
echo ""
echo "Process limits:"
ulimit -a

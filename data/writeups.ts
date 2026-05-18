import { Writeup } from '../types';

export const mockWriteups: Writeup[] = [
  {
    id: '1',
    title: 'Pickle Rick - TryHackMe Walkthrough',
    category: 'TryHackMe',
    tags: ['web', 'enumeration', 'rce'],
    author: 'Ducky',
    date: '2024-05-10',
    difficulty: 'Easy',
    status: 'public',
    createdAt: '2024-05-10T00:00:00.000Z',
    updatedAt: '2024-05-10T00:00:00.000Z',
    summary: 'A Rick and Morty themed CTF. This walkthrough covers finding the three ingredients to help Rick transform back to a human.',
    content: `
# Pickle Rick CTF

This Rick and Morty themed challenge requires you to exploit a webserver to find 3 ingredients that will help Rick make his potion to become human again.

## Enumeration

Starting with a basic Nmap scan:

\`\`\`bash
nmap -sV -sC -p- 10.10.1.5
\`\`\`

We find ports 22 (SSH) and 80 (HTTP) open.

### Web Discovery

Checking the source code of the main page revealed a comment:
\`\`\`html
<!-- Note to self, remember username! Username: R1ckRul3s -->
\`\`\`

## Exploitation

I found a \`robots.txt\` file containing the string: \`WubbaLubbaDubDub\`.
Testing this on the \`login.php\` page with the username revealed earlier worked!

The command panel allows us to execute system commands.

\`\`\`bash
ls -la
\`\`\`

Found the first ingredient: \`Sup3rS3cr3tPickl3Ingr3di3nt.txt\`.

## Privilege Escalation

Checking sudo permissions:
\`\`\`bash
sudo -l
\`\`\`

The user can run anything without a password!
\`\`\`bash
sudo ls /root
\`\`\`
    `
  },
  {
    id: '2',
    title: 'EternalBlue (MS17-010) CVE Explanation',
    category: 'CVE',
    tags: ['windows', 'smb', 'exploit'],
    author: 'ArchWriter',
    date: '2024-04-15',
    difficulty: 'Medium',
    status: 'public',
    createdAt: '2024-04-15T00:00:00.000Z',
    updatedAt: '2024-04-15T00:00:00.000Z',
    summary: 'A deep dive into the MS17-010 vulnerability that was used by the WannaCry ransomware.',
    content: `
# EternalBlue (CVE-2017-0144)

EternalBlue is an exploit developed by the NSA and leaked by the Shadow Brokers. It exploits a vulnerability in Microsoft's SMBv1 protocol.

## How it works

The vulnerability exists in the way the SMBv1 server handles specially crafted packets. 

### Vulnerable Code Segment

\`\`\`c
// Simplified representation of the buffer overflow
void HandleSMB(unsigned char* buffer, size_t size) {
    char localBuffer[512];
    if (size > 0) {
        memcpy(localBuffer, buffer, size); // No length check here!
    }
}
\`\`\`

## Impact

The exploit allows unauthenticated attackers to execute arbitrary code on the target machine with SYSTEM privileges.

## Mitigation

1. Disable SMBv1.
2. Apply security patch **MS17-010**.
3. Use a Firewall to block port 445.
    `
  },
  {
    id: '3',
    title: 'Reflective XSS on E-commerce Platform',
    category: 'Bug Bounty',
    tags: ['web', 'xss', 'javascript'],
    author: 'BugHunter',
    date: '2024-05-01',
    status: 'public',
    createdAt: '2024-05-01T00:00:00.000Z',
    updatedAt: '2024-05-01T00:00:00.000Z',
    summary: 'Found a reflective XSS vulnerability in the search parameter of a large e-commerce site.',
    content: `
# Bug Bounty Report: Reflective XSS

## Vulnerability Details

The search parameter \`q\` in the search page was not being properly sanitized before being rendered in the HTML.

### Payload

\`\`\`html
<script>alert('XSS by BugHunter')</script>
\`\`\`

### Impact

An attacker could craft a URL and send it to a victim. When the victim clicks the link, the script will execute in their browser context. This could be used for session hijacking.

## Recommendation

Use proper output encoding for all user-supplied data before rendering it in the DOM.
    `
  }
];

FROM ubuntu:24.04

# ১. এনভায়রনমেন্ট ভেরিয়েবল
ENV DEBIAN_FRONTEND=noninteractive \
    RESOLUTION=1920x1080 \
    VNC_PW=DarkKiller@2026 \
    BRAND_NAME="Dark Killer"

# ২. প্রয়োজনীয় প্যাকেজ ইনস্টল (এক লেয়ারে)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        wget curl ca-certificates gnupg \
        xfce4 xfce4-goodies xfce4-terminal \
        tigervnc-standalone-server tigervnc-tools \
        novnc websockify \
        firefox \
        dbus-x11 feh socat \
        git vim nano htop neofetch tree \
        python3 python3-pip \
        unzip zip p7zip-full \
        file-roller \
        net-tools iputils-ping \
        pulseaudio pulseaudio-utils \
        nginx \
        openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# ৩. ব্যানার ডাউনলোড ও ব্যাকগ্রাউন্ড সেট
RUN mkdir -p /usr/share/backgrounds/xfce /usr/share/images/desktop-base && \
    curl -fsSL "https://raw.githubusercontent.com/adminnirobvai1-ux/Ndjdjdj/refs/heads/main/IMG_20260920_222317_682.jpg" \
         -o /usr/share/backgrounds/custom_bg.png && \
    cp /usr/share/backgrounds/custom_bg.png /usr/share/backgrounds/xfce/xfce-blue.jpg && \
    cp /usr/share/backgrounds/custom_bg.png /usr/share/backgrounds/xfce/xfce-stripes.png && \
    cp /usr/share/backgrounds/custom_bg.png /usr/share/backgrounds/xfce/xfce-teal.jpg && \
    find /usr/share/backgrounds -type f -exec cp /usr/share/backgrounds/custom_bg.png {} + 2>/dev/null || true

# ৪. টার্মিনাল ব্র্যান্ডিং
RUN echo 'export PS1="\[\e[1;31m\][Dark-Killer]\[\e[0m\]:\w# "' >> /root/.bashrc && \
    echo 'echo -e "\n============================================\n   Welcome to Dark Killer Remote Desktop\n============================================\n"' >> /root/.bashrc

# ৫. XFCE ওয়ালপেপার কনফিগ
RUN mkdir -p /etc/xdg/xfce4/xfconf/xfce-perchannel-xml \
             /root/.config/xfce4/xfconf/xfce-perchannel-xml && \
    printf '%s\n' \
    '<?xml version="1.0" encoding="UTF-8"?>' \
    '<channel name="xfce4-desktop" version="1.0">' \
    '  <property name="backdrop" type="empty">' \
    '    <property name="screen0" type="empty">' \
    '      <property name="monitor0" type="empty">' \
    '        <property name="workspace0" type="empty">' \
    '          <property name="image-style" type="int" value="5"/>' \
    '          <property name="last-image" type="string" value="/usr/share/backgrounds/custom_bg.png"/>' \
    '        </property>' \
    '      </property>' \
    '    </property>' \
    '  </property>' \
    '</channel>' \
    > /etc/xdg/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml && \
    cp /etc/xdg/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml \
       /root/.config/xfce4/xfconf/xfce-perchannel-xml/

# ৬. VNC পাসওয়ার্ড + কনফিগ
RUN mkdir -p /root/.vnc && \
    echo "$VNC_PW" | vncpasswd -f > /root/.vnc/passwd && \
    chmod 600 /root/.vnc/passwd && \
    printf '%s\n' \
    'securitytypes=VncAuth' \
    'geometry=1920x1080' \
    'depth=24' \
    'localhost=no' \
    > /root/.vnc/config

# ৭. VNC স্টার্টআপ স্ক্রিপ্ট
RUN printf '%s\n' \
    '#!/bin/bash' \
    'unset SESSION_MANAGER' \
    'unset DBUS_SESSION_BUS_ADDRESS' \
    'export DISPLAY=:1' \
    '(' \
    '  sleep 2' \
    '  for p in $(xfconf-query -c xfce4-desktop -l 2>/dev/null | grep "last-image"); do' \
    '    xfconf-query -c xfce4-desktop -p "$p" -s /usr/share/backgrounds/custom_bg.png 2>/dev/null' \
    '  done' \
    '  for p in $(xfconf-query -c xfce4-desktop -l 2>/dev/null | grep "image-style"); do' \
    '    xfconf-query -c xfce4-desktop -p "$p" -s 5 2>/dev/null' \
    '  done' \
    '  xfconf-query -c xfce4-panel -p /plugins/plugin-1/button-title -s "Dark Killer" --create -t string 2>/dev/null' \
    '  xfconf-query -c xfce4-panel -p /plugins/plugin-1/show-button-title -s true --create -t bool 2>/dev/null' \
    ') &' \
    'exec startxfce4' \
    > /root/.vnc/xstartup && \
    chmod +x /root/.vnc/xstartup

# ৮. noVNC ব্র্যান্ডিং + অটো-স্কেল
RUN ln -sf /usr/share/novnc/vnc.html /usr/share/novnc/index.html && \
    sed -i 's/<title>noVNC<\/title>/<title>Dark Killer<\/title>/g' \
        /usr/share/novnc/vnc.html 2>/dev/null || true && \
    sed -i "s/'resize', 'off'/'resize', 'scale'/g" \
        /usr/share/novnc/app/ui.js 2>/dev/null || true

# ৯. ডেস্কটপ শর্টকাট
RUN mkdir -p /root/Desktop && \
    printf '%s\n' \
    '[Desktop Entry]' \
    'Type=Application' \
    'Name=Terminal' \
    'Exec=xfce4-terminal' \
    'Icon=utilities-terminal' \
    'Terminal=false' \
    > /root/Desktop/terminal.desktop && \
    printf '%s\n' \
    '[Desktop Entry]' \
    'Type=Application' \
    'Name=Firefox' \
    'Exec=firefox' \
    'Icon=firefox' \
    'Terminal=false' \
    > /root/Desktop/firefox.desktop && \
    chmod +x /root/Desktop/*.desktop

# ১০. হেলথ চেক স্ক্রিপ্ট
RUN printf '%s\n' \
    '#!/bin/bash' \
    'curl -fs http://localhost:8080/ >/dev/null 2>&1 || exit 1' \
    > /healthcheck.sh && chmod +x /healthcheck.sh

# ১১. এন্ট্রি-পয়েন্ট
RUN printf '%s\n' \
    '#!/bin/bash' \
    'set -e' \
    '' \
    'echo "=========================================="' \
    'echo "   Dark Killer Remote Desktop Starting"' \
    'echo "=========================================="' \
    '' \
    '# পুরনো লক ফাইল মুছুন' \
    'rm -rf /tmp/.X*-lock /tmp/.X11-unix/X* 2>/dev/null || true' \
    'pkill -f Xtigervnc 2>/dev/null || true' \
    '' \
    '# VNC সার্ভার চালু' \
    'vncserver :1 -geometry ${RESOLUTION} -depth 24 -SecurityTypes VncAuth' \
    '' \
    '# socat fallback পোর্ট' \
    'PORTS="8081 8082 8083 8084 8085 6080 6081 6082 6083"' \
    'for p in $PORTS; do' \
    '  socat TCP-LISTEN:$p,fork,reuseaddr TCP:localhost:8080 >/dev/null 2>&1 &' \
    'done' \
    '' \
    '# ডাইনামিক PORT' \
    'if [ -n "$PORT" ] && [ "$PORT" != "8080" ]; then' \
    '  socat TCP-LISTEN:$PORT,fork,reuseaddr TCP:localhost:8080 >/dev/null 2>&1 &' \
    'fi' \
    '' \
    '# noVNC সার্ভার (মেইন প্রসেস)' \
    'exec websockify --web=/usr/share/novnc/ 8080 localhost:5901' \
    > /entrypoint.sh && chmod +x /entrypoint.sh

# ১২. Persistent Storage ভলিউম
VOLUME ["/root/Desktop", "/root/Documents", "/data"]

# ১৩. হেলথ চেক
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD /healthcheck.sh

# ১৪. পোর্ট
EXPOSE 8080 8081 8082 8083 8084 8085 6080 6081 6082 6083

# ১৫. স্টার্টআপ
CMD ["/entrypoint.sh"]

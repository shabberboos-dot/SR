FROM ubuntu:20.04

# ১. এনভায়রনমেন্ট ভেরিয়েবল সেটআপ
ENV DEBIAN_FRONTEND=noninteractive \
    RESOLUTION=1280x720 \
    BRAND_NAME="Dark Killer"

# ২. প্রয়োজনীয় প্যাকেজ ও socat ইনস্টল
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        wget \
        curl \
        ca-certificates \
        xfce4 \
        xfce4-terminal \
        tigervnc-standalone-server \
        novnc \
        websockify \
        firefox \
        dbus-x11 \
        feh \
        socat && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ৩. ব্যানার ডাউনলোড ও ব্যাকগ্রাউন্ড রিপ্লেস
RUN mkdir -p /usr/share/backgrounds/xfce /usr/share/images/desktop-base && \
    curl -fsSL "https://raw.githubusercontent.com/adminnirobvai1-ux/Ndjdjdj/refs/heads/main/IMG_20260920_222317_682.jpg" -o /usr/share/backgrounds/custom_bg.png && \
    cp /usr/share/backgrounds/custom_bg.png /usr/share/backgrounds/xfce/xfce-blue.jpg && \
    cp /usr/share/backgrounds/custom_bg.png /usr/share/backgrounds/xfce/xfce-stripes.png && \
    cp /usr/share/backgrounds/custom_bg.png /usr/share/backgrounds/xfce/xfce-teal.jpg && \
    find /usr/share/backgrounds -type f -exec cp /usr/share/backgrounds/custom_bg.png {} + 2>/dev/null || true

# ৪. টার্মিনাল ব্র্যান্ডিং (Dark Killer)
RUN echo 'export PS1="\[\e[1;31m\][Dark-Killer]\[\e[0m\]:\w# "' >> /root/.bashrc && \
    echo 'echo -e "\n============================================\n   Welcome to Dark Killer Remote Desktop\n============================================\n"' >> /root/.bashrc

# ৫. ব্যানার ফিট কনফিগারেশন (XFCE XML)
RUN mkdir -p /etc/xdg/xfce4/xfconf/xfce-perchannel-xml /root/.config/xfce4/xfconf/xfce-perchannel-xml && \
    echo '<?xml version="1.0" encoding="UTF-8"?>\n\
<channel name="xfce4-desktop" version="1.0">\n\
  <property name="backdrop" type="empty">\n\
    <property name="screen0" type="empty">\n\
      <property name="monitor0" type="empty">\n\
        <property name="workspace0" type="empty">\n\
          <property name="image-style" type="int" value="5"/>\n\
          <property name="last-image" type="string" value="/usr/share/backgrounds/custom_bg.png"/>\n\
        </property>\n\
      </property>\n\
    </property>\n\
  </property>\n\
</channel>' > /etc/xdg/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml && \
    cp /etc/xdg/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml /root/.config/xfce4/xfconf/xfce-perchannel-xml/

# ৬. VNC ও স্টার্টআপ স্ক্রিপ্ট কনফিগারেশন
RUN mkdir -p /root/.vnc && \
    echo "securitytypes=None" > /root/.vnc/config && \
    echo '#!/bin/bash\n\
unset SESSION_MANAGER\n\
unset DBUS_SESSION_BUS_ADDRESS\n\
export DISPLAY=:1\n\
( \n\
  sleep 2\n\
  for p in $(xfconf-query -c xfce4-desktop -l 2>/dev/null | grep "last-image"); do \n\
    xfconf-query -c xfce4-desktop -p "$p" -s /usr/share/backgrounds/custom_bg.png 2>/dev/null \n\
  done \n\
  for p in $(xfconf-query -c xfce4-desktop -l 2>/dev/null | grep "image-style"); do \n\
    xfconf-query -c xfce4-desktop -p "$p" -s 5 2>/dev/null \n\
  done \n\
  xfconf-query -c xfce4-panel -p /plugins/plugin-1/button-title -s "Dark Killer" --create -t string 2>/dev/null \n\
  xfconf-query -c xfce4-panel -p /plugins/plugin-1/show-button-title -s true --create -t bool 2>/dev/null \n\
) &\n\
exec startxfce4' > /root/.vnc/xstartup && \
    chmod +x /root/.vnc/xstartup

# ৭. ব্রাউজার টাইটেল Dark Killer ও অটো-স্কেল (noVNC)
RUN ln -sf /usr/share/novnc/vnc.html /usr/share/novnc/index.html && \
    sed -i 's/<title>noVNC<\/title>/<title>Dark Killer<\/title>/g' /usr/share/novnc/vnc.html && \
    sed -i "s/'resize', 'off'/'resize', 'scale'/g" /usr/share/novnc/app/ui.js 2>/dev/null || true

# ৮. এন্ট্রি-পয়েন্ট স্ক্রিপ্ট তৈরি (স্টার্টআপ ক্লিন করার জন্য)
RUN echo '#!/bin/bash\n\
# Clean lock files\n\
rm -rf /tmp/.X*-lock /tmp/.X11-unix/X*\n\
\n\
# Start VNC Server\n\
vncserver :1 -geometry ${RESOLUTION} -depth 24 -SecurityTypes None\n\
\n\
# Port mapping with socat\n\
PORTS="8081 8082 8083 8084 8085 8086 8087 8088 8089 6080 6081 6082 6083 6084 6085 6086 6087 6088 6089"\n\
for p in $PORTS; do\n\
    socat TCP-LISTEN:$p,fork,reuseaddr TCP:localhost:8080 2>/dev/null &\n\
done\n\
\n\
# Forward dynamic PORT if set\n\
if [ -n "$PORT" ] && [ "$PORT" != "8080" ]; then\n\
    socat TCP-LISTEN:$PORT,fork,reuseaddr TCP:localhost:8080 2>/dev/null &\n\
fi\n\
\n\
# Start websockify (Main Process)\n\
exec websockify --web=/usr/share/novnc/ 8080 localhost:5901\n' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# ৯. পোর্ট EXPOSE
EXPOSE 8080 8081 8082 8083 8084 8085 8086 8087 8088 8089 6080 6081 6082 6083 6084 6085 6086 6087 6088 6089

# ১০. কন্টেইনার স্টার্টআপ কমান্ড
CMD ["/entrypoint.sh"]

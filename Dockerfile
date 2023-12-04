FROM ubuntu:focal

ENV NODE_VERSION v16.13.1
ENV HOME /home/ciUser
ENV NVM_DIR $HOME/.nvm

RUN	apt-get update && \
	DEBIAN_FRONTEND="noninteractive" apt-get -y install apt-utils \
	tzdata make git wget curl sudo gnupg gstreamer1.0-libav && \
	useradd -ms /bin/bash ciUser && \
	usermod -aG sudo ciUser && \
	echo "ciUser ALL=(ALL:ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/ciUser

RUN	wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash && \
	. "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION} && \
	nvm alias default ${NODE_VERSION} && \
	nvm use default

ENV NODE_PATH ${HOME}/.nvm/versions/node/${NODE_VERSION}/lib/node_modules
ENV PATH ${HOME}/.nvm/versions/node/${NODE_VERSION}/bin:${PATH}

USER ciUser
RUN	mkdir -p $HOME/tests && cd $HOME/tests
WORKDIR $HOME/tests

RUN npx playwright install && \
	npx playwright install chrome && \
	npx playwright install webkit && \
	npx playwright install-deps



COPY package* ./
RUN npm i

COPY . .

CMD ["/bin/bash"]

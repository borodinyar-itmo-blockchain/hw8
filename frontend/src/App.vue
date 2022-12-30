<template style="background: #b5f0ff">
    <div id="app">
        <div style="display: flex; flex-direction: column;">
            <!-- Upload Interface -->
            <div id="upload">
                <div v-if="this.$root.$data.loading === false">
                    <h1>hw8</h1>

                    <!-- Form for file choose, caption text and submission -->
                    <form
                        class="margin-sm"
                        @submit.stop.prevent="handleSubmit"
                    >

                        <div class="border-style">
                            <input
                                type="file"
                                @change="uploadFile"
                                ref="file"
                            />
                        </div>
                        <button
                            class="margin-xs"
                            variant="secondary"
                            @click="handleOk"
                        >
                            Upload
                        </button>
                    </form>
                </div>
                <div
                    v-if="this.$root.$data.loading === true"
                    style="margin-top: 10%; margin-bottom: 5%"
                >
                    <h1>Uploading...</h1>
                    <img
                        class="upload-load"
                        src="https://media.giphy.com/media/2A6xoqXc9qML9gzBUE/giphy.gif"
                    >
                </div>
            </div>

            <button
                class="margin-xs"
                variant="secondary"
                @click="showOk"
            >
                Show File
            </button>
            <div
                v-if="this.$root.$data.show === true"
                class="card">
                <img
                    class="card-img-top"
                    style="object-fit: contain; border: 1px solid #004877;"
                    :src="this.$root.$data.ipfsUrl"
                    alt="Card image cap">
            </div>

        </div>
    </div>
</template>

<script>
import {defineComponent, ref} from 'vue'
import {create, CID} from 'kubo-rpc-client'
import {ethers} from 'ethers'
import Web3 from 'web3'
import StorageForHashes from '../../artifacts/contracts/StorageForHashes.sol/StorageForHashes.json'

const file = ref(null)
const client = create({
    host: 'localhost',
    port: 5001,
    protocol: 'http'
})

const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';


export default {
    name: 'App',
    // data variables
    data() {
        return {
            file: undefined,
            loading: false,
            contract: null,
            show: false,
            ipfsUrl: null,
        };
    },

    methods: {
        async initWeb3Account() {
            if (window.ethereum) {
                this.provider = window.ethereum;
                try {
                    await window.ethereum.request({method: 'eth_requestAccounts'})
                } catch (error) {
                    console.log("User denied account access");
                }
            } else if (window.web3) {
                this.provider = window.web3.currentProvider;
            } else {
                this.provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
                console.log("HttpProvider");
            }
            this.web3 = new Web3(this.provider);
            this.web3.eth.getAccounts().then(accs => {
                this.account = accs[0]
            })
        },

        async uploadFile() {
            this.file = this.$refs.file.files[0]
            console.log(this.file)
        },

        async createContract() {
            await this.initWeb3Account();
            const signer = new ethers.providers.Web3Provider(this.provider).getSigner();
            console.log("Signer: ", signer);
            this.contract = new ethers.Contract(
                contractAddress,
                StorageForHashes.abi,
                signer
            );
        },

        async onSubmit() {

            this.$root.loading = true;
            let imgHash;
            const added = await client.add(this.file)

            imgHash = added.cid.bytes;

            try {
                await this.createContract();
                const tx = await this.contract.setHash(imgHash);
                // wait for transaction to be mined
                await tx.wait();
                console.log('Transaction successful');
                console.log("Transaction: ", tx);
                this.$root.loading = false;
                alert('Image uploaded to IPFS & Contract!');
            } catch (err) {
                console.log("Error: ", err);
                this.$root.loading = false;
                alert('Error: Image not uploaded to Contract!');
            }

        },

        handleOk() {
            if (!this.file) {
                alert('Please fill in the information.');
            } else {
                this.onSubmit();
            }
        },

        async showOk() {
            this.$root.show = true;
            try {
                await this.createContract();
                const hash = await this.contract.getHash().then((res) => {
                    console.log("Hash: ", res);
                    return ethers.utils.arrayify(res);
                });

                const cid = CID.decode(hash)
                const file = client.cat(cid)
                const content = []
                for await (const chunk of file) {
                    content.push(chunk)
                }
                const blob = new Blob(content, {type: 'image/jpeg'})

                this.ipfsUrl = window.URL.createObjectURL(blob)
            } catch (err) {
                console.log("Error: ", err);
                alert('Error: Image not uploaded to Contract!');
            }
        },
    },
};
</script>

<style>

#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: rgb(0, 72, 119);
    margin-top: 3%;
}

.card img {
    object-fit: cover;
    height: 500px;
    width: 500px;
}

.card {
    object-fit: contain;
}

#upload {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #004877;
    margin-bottom: 5%;
    width: 500px;
}

.upload-load {
    width: 50px;
    height: 50px;
}

.margin-xs {
    margin-top: 3%;
}

.margin-sm {
    margin-top: 7%;
}

.border-style {
    border: 1px solid #004877;
}
</style>
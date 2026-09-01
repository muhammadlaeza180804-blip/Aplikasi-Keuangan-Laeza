// ===============================
// DATA TRANSAKSI
// ===============================

let transaksi = [];
async function ambilTransaksi() {
    const { data, error } = await supabaseClient
        .from("transaksi")
        .select("*")
        .order("tanggal", { ascending: false });

    if (error) {
        console.error("Gagal mengambil data:", error);
        return;
    }

    transaksi = data || [];

    updateDashboard();
    tampilkanTransaksi();
}
let editId = null;


// ===============================
// ELEMENT HTML
// ===============================

const form = document.getElementById("formTransaksi");

const jenisInput = document.getElementById("jenis");
const tanggalInput = document.getElementById("tanggal");
const kategoriInput = document.getElementById("kategori");
const keteranganInput = document.getElementById("keterangan");
const nominalInput = document.getElementById("nominal");

const daftarTransaksi =
    document.getElementById("daftarTransaksi");

const filterJenis =
    document.getElementById("filterJenis");

const saldoElement =
    document.getElementById("saldo");

const pemasukanElement =
    document.getElementById("pemasukan");

const pengeluaranElement =
    document.getElementById("pengeluaran");

const kosongElement =
    document.getElementById("kosong");


// ===============================
// FORMAT RUPIAH
// ===============================

function formatRupiah(angka) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);

}


// ===============================
// SIMPAN DATA
// ===============================

async function simpanData() {
    const { error } = await supabaseClient
        .from("transaksi")
        .insert(transaksi);

    if (error) {
        console.error("Gagal menyimpan transaksi:", error);
        alert("Gagal menyimpan transaksi.");
        return false;
    }

    return true;
}


// ===============================
// TAMPILKAN DASHBOARD
// ===============================

function updateDashboard() {

    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    transaksi.forEach(item => {

        if (item.jenis === "pemasukan") {

            totalPemasukan += item.nominal;

        } else {

            totalPengeluaran += item.nominal;

        }

    });

    const saldo = totalPemasukan - totalPengeluaran;

    pemasukanElement.textContent =
        formatRupiah(totalPemasukan);

    pengeluaranElement.textContent =
        formatRupiah(totalPengeluaran);

    saldoElement.textContent =
        formatRupiah(saldo);

}


// ===============================
// TAMPILKAN TRANSAKSI
// ===============================

function tampilkanTransaksi() {

    daftarTransaksi.innerHTML = "";

    const filter = filterJenis.value;

    let data = transaksi;

    if (filter !== "semua") {

        data = transaksi.filter(
            item => item.jenis === filter
        );

    }

    // Urutkan berdasarkan tanggal terbaru
    data.sort(
        (a, b) =>
            new Date(b.tanggal) -
            new Date(a.tanggal)
    );


    if (data.length === 0) {

        kosongElement.style.display = "block";

        return;

    }

    kosongElement.style.display = "none";


    data.forEach(item => {

        const row = document.createElement("tr");

        const tanda =
            item.jenis === "pemasukan"
                ? "+"
                : "-";

        const classNominal =
            item.jenis === "pemasukan"
                ? "masuk"
                : "keluar";


        row.innerHTML = `

            <td>
                ${formatTanggal(item.tanggal)}
            </td>

            <td>
                ${item.keterangan}
            </td>

            <td>
                ${item.kategori}
            </td>

            <td>
                ${
                    item.jenis === "pemasukan"
                    ? "Pemasukan"
                    : "Pengeluaran"
                }
            </td>

            <td class="${classNominal}">
                ${tanda} ${formatRupiah(item.nominal)}
            </td>

            <td>

                <button
                    class="btn-edit"
                    onclick="editTransaksi(${item.id})"
                >
                    Edit
                </button>

                <button
                    class="btn-hapus"
                    onclick="hapusTransaksi(${item.id})"
                >
                    Hapus
                </button>

            </td>

        `;

        daftarTransaksi.appendChild(row);

    });

}


// ===============================
// FORMAT TANGGAL
// ===============================

function formatTanggal(tanggal) {

    const date = new Date(tanggal);

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


// ===============================
// TAMBAH TRANSAKSI
// ===============================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const jenis =
            jenisInput.value;

        const tanggal =
            tanggalInput.value;

        const kategori =
            kategoriInput.value;

        const keterangan =
            keteranganInput.value;

        const nominal =
            Number(nominalInput.value);


        // Validasi

        if (
            !jenis ||
            !tanggal ||
            !kategori ||
            !keterangan ||
            nominal <= 0
        ) {

            alert(
                "Mohon lengkapi semua data."
            );

            return;

        }


        // MODE EDIT

        if (editId !== null) {

            const index =
                transaksi.findIndex(
                    item => item.id === editId
                );

            if (index !== -1) {

                transaksi[index] = {

                    id: editId,
                    jenis,
                    tanggal,
                    kategori,
                    keterangan,
                    nominal

                };

            }

            editId = null;

            document.querySelector(
                ".btn-tambah"
            ).textContent =
                "+ Tambah Transaksi";


        }

        // MODE TAMBAH

        // MODE TAMBAH

else {

    const dataBaru = {

        jenis: jenis,

        tanggal: tanggal,

        kategori: kategori,

        keterangan: keterangan,

        nominal: nominal

    };

    const { data, error } = await supabaseClient
        .from("transaksi")
        .insert([dataBaru])
        .select();

    if (error) {

        console.error("Gagal menyimpan:", error);

        alert("Gagal menyimpan transaksi.");

        return;

    }

    transaksi.push(data[0]);

}


        simpanData();

        updateDashboard();

        tampilkanTransaksi();

        form.reset();

    }
);


// ===============================
// EDIT TRANSAKSI
// ===============================

function editTransaksi(id) {

    const item =
        transaksi.find(
            transaksi => transaksi.id === id
        );

    if (!item) return;


    jenisInput.value =
        item.jenis;

    tanggalInput.value =
        item.tanggal;

    kategoriInput.value =
        item.kategori;

    keteranganInput.value =
        item.keterangan;

    nominalInput.value =
        item.nominal;


    editId = id;


    document.querySelector(
        ".btn-tambah"
    ).textContent =
        "💾 Simpan Perubahan";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ===============================
// HAPUS TRANSAKSI
// ===============================

function hapusTransaksi(id) {

    const konfirmasi =
        confirm(
            "Apakah Anda yakin ingin menghapus transaksi ini?"
        );


    if (!konfirmasi) return;


    transaksi =
        transaksi.filter(
            item => item.id !== id
        );


    simpanData();

    updateDashboard();

    tampilkanTransaksi();

}


// ===============================
// FILTER
// ===============================

filterJenis.addEventListener(
    "change",
    tampilkanTransaksi
);


// ===============================
// JALANKAN APLIKASI
// ===============================

ambilTransaksi();

const mockAlbums = [
    {
        id: 1, 
        albumName: "Aspirituality",
        albumPrice: 99,
        releaseYear: 2023,
        coverImage: "/images/aspirituality.jpg",
        description: "test",
        beats: [
            {
                id: 1,
                albumId: 1,
                beatName: "bit 621",
                beatPrice: 9,
                previewUrl: "/audio/previews/aspirituality/bit621-preview.wav"
            },
            {
                id: 2,
                albumId: 1,
                beatName: "chaconTwo",
                beatPrice: 9,
                previewUrl: "/audio/previews/aspirituality/chacontwo-preview.wav"
            },
            {
                id: 3,
                albumId: 1,
                beatName: "Foolas",
                beatPrice: 9,
                previewUrl: "/audio/previews/aspirituality/foolas-preview.wav"
            }
        ]
    },
    {
        id:2,
        albumName: "The Green",
        albumPrice: 99,
        releaseYear: 2021,
        coverImage: "/images/theGreen.jpg",
        description: "ett till test",
        beats: []
    }
];

export default mockAlbums;